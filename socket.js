const db = require('./db/db');
const sequelize = require('sequelize');
const Op = require('sequelize').Op;
const filePreview = require('filepreview-es6');
const fs = require('fs');
const config = require('config');
const common = require('./helpers/common');
const jwt = require('jsonwebtoken');


const users = db.models.users;
const companies = db.models.companies;
const groups = db.models.groups;
const groupa = db.models.groups;
const groupMembers = db.models.groupMembers;
const chatMessages = db.models.chatMessages;
const textMessages = db.models.textMessages;
const mediaMessages = db.models.mediaMessages;
const clearedMessages = db.models.clearedMessages;
const messagesStatus = db.models.messagesStatus;
var token, groupID;


chatMessages.hasMany(textMessages, {
  foreignKey: 'messageId'
});
chatMessages.hasMany(mediaMessages, {
  foreignKey: 'messageId'
});
chatMessages.hasMany(messagesStatus, {
  foreignKey: 'messageId'
});
chatMessages.belongsTo(users, {
  foreignKey: 'senderId'
});
chatMessages.belongsTo(companies, {
  foreignKey: 'adminId'
});
chatMessages.belongsTo(groupMembers, {
  foreignKey: 'groupId'
})
chatMessages.belongsTo(groupa, {
  foreignKey: 'groupId'
})
groupa.hasMany(groupMembers, {
  foreignKey: 'groupId'
})

const failure = 'Something Went Wrong!!! Please Try Again';



module.exports = function (io) {
  io.on('connection', (socket) => {
    /*
     Return event to tell user is connected to Socket on Server
    */
    socket.emit('userConnected', socket.id);
    /*
    Join Room   
    */
    socket.on('joinRoom', async (data) => {
      try {
        token = data.authToken;
        const authToken = data.authToken;
        const receiverId = data.receiverId;
        const groupId = data.groupId;
        if (!authToken) {
          return socket.emit('errorMessage', 'Please Provide JWT Token');
        }
        jwt.verify(authToken, config.jwtToken, async function (err) {

          if (err) {
            return socket.emit('errorMessage', 'Invalid User');
          } else {
            const senderId = await common.userId(authToken);
            // const senderId = "86091af5-38b8-4355-9257-17774e2a98f1";
            if(!groupId) {
            if (!receiverId) {
              return socket.emit('errorMessage', 'Receiver Id is required');
            }
            /*
            Check Sender And Receiver groupExists In our DB
           */

            const sender = await users.findOne({
              attributes: ['id'],
              where: {
                id: senderId
              },
            });

            if (!sender) {
              const comp = await companies.findOne({
                attributes: ['id'],
                where: {
                  id: senderId
                },
              });
              if(!comp ){
                return socket.emit('errorMessage', 'Invalid Sender');

              }
            }

            const receiver = await users.findOne({
              attributes: ['id'],
              where: {
                id: receiverId
              },
            })

            if (!receiver) {
              const comp = await companies.findOne({
                attributes: ['id'],
                where: {
                  id: receiverId
                },
              });
              if(!comp){
                return socket.emit('errorMessage', 'Invalid Receiver');

              }
            }

            /*
            Check if these two users have communicated with each other or not
          */
            const groupExists = await groups.findOne({
              attributes: ['id', 'name'],
              where: {
                [Op.or]: [
                  {
                    name: `${senderId}_${receiverId}`,
                  },
                  {
                    name: `${receiverId}_${senderId}`,
                  }
                ]
              },
            })

            if (!groupExists) {

              const groupData = {};
              groupData.name = `${senderId}_${receiverId}`;
              groupData.createdBy = senderId;
              const createGroup = await groups.create(groupData);
              if (createGroup) {

                const membersData = [
                  {
                    groupId: createGroup.dataValues.id,
                    userId: senderId
                  },
                  {
                    groupId: createGroup.dataValues.id,
                    userId: receiverId
                  }
                ];
                const createMembers = await groupMembers.bulkCreate(membersData);
                if (createMembers) {
                  groupID = createGroup.dataValues.id;
                  socket.join(createGroup.dataValues.id);
                  socket.emit('joinRoomRes',{ groupId:createGroup.dataValues.id } )
                  return socket.emit('joinRoom', { groupId: createGroup.dataValues.id });
                }
              }
            } else {
              groupID = groupExists.dataValues.id;
              socket.join(groupExists.dataValues.id);

              socket.emit('joinRoomRes',{ groupId: groupExists.dataValues.id } )
              return socket.emit('joinRoom', { groupId: groupExists.dataValues.id });
            }
          } else {
            groupID = groupId;
            socket.join(groupId);

            socket.emit('joinRoomRes',{ groupId: data.groupId } )

            return socket.emit('joinRoom', { groupId: data.groupId });
          }
        }
        });


      } catch (err) {
        console.log('errr', err)
        if (err.hasOwnProperty('original')) {
          errorMessage = err.original.sqlMessage;
        } else if (err.hasOwnProperty('message')) {
          errorMessage = err.message;
        } else {
          errorMessage = failure;
        }
        return socket.emit('errorMessage', errorMessage);

      }
    });

    /*
    Leave Room   
    */
    socket.on('leaveRoom', async (data) => {
      try {
        const authToken = data.authToken;
        const groupId = data.groupId;
        if (!authToken) {
          return socket.emit('errorMessage', 'Please Provide JWT Token');
        }
        if (!groupId) {
          return socket.emit('errorMessage', 'Group Id is required');
        }
        jwt.verify(authToken, config.jwtToken, async function (err) {
          if (err) {
            return socket.emit('errorMessage', 'Invalid User');
          } else {
            socket.leave(groupId);
            const senderId = await common.userId(authToken);
            socket.broadcast.to(groupId).emit('leaveRoom', { groupId: groupId, userId: senderId });
          }
        })
      } catch (err) {
        socket.emit('errorMessage', failure);

      }
    })

    /*
   Send Message   
   */
    socket.on('sendMessage', async (data) => {
      try {
		    const authToken = data.authToken;
        const type = data.type;
        var groupId;
        if(data.groupId)
           groupId = data.groupId;
        else
          groupId = groupID;

        if (!authToken) {
          return socket.emit('errorMessage', 'Please Provide JWT Token');
        }

        if (!type) {
          return socket.emit('errorMessage', 'Message Type is required');
        }
        if (!groupId) {
          return socket.emit('errorMessage', 'Group is required');
        }
        jwt.verify(authToken, config.jwtToken, async function (err) {
          if (err) {
            return socket.emit('errorMessage', 'Invalid User');
          } else {
            const senderId = await common.userId(authToken);
            // const senderId = "86091af5-38b8-4355-9257-17774e2a98f1";
            const message = {};
            if(data.usertype == "admin"){
              message.adminId = senderId;
              // message.senderId = 0;
            }else{  
              message.senderId = senderId;
              // message.adminId = 0;

            }
            message.type = type;
            message.groupId = groupId;
            if (data.actualMessageId) {
              message.actualMessageId = data.actualMessageId;
              message.messageType = data.messageType;   //////////// 1= replied,2 = forwarded,3 = starred
            }
            const chatMessage = await chatMessages.create(message);
            if (chatMessage) {
              const getUsers = await groupMembers.findAll({
                attributes: ['userId'],
                where: {
                  groupId: groupId,
                  userId: {
                    [Op.ne]: senderId
                  }
                }
              })

              if (getUsers) {
                await Promise.all(
                  getUsers.map(async user => {
                    const users = {};
                    users.messageId = chatMessage.dataValues.id;
                    if(data.usertype == "user"){
                      users.adminId = user.userId;
                    } else{
                      users.userId = user.userId;
                    }

                    const messageStatus = await messagesStatus.create(users);
                  })
                )
              }
              if (type == 1) {          /////// 1 = text message
                const text = {};
                text.messageId = chatMessage.dataValues.id;
                text.message = data.message;
                const textMessage = await textMessages.create(text);
                if (!textMessage) {
                  const deleteMessage = await chatMessages.destroy({
                    where: {
                      id: chatMessage.dataValues.id
                    }
                  })
                  if (deleteMessage) {
                    return socket.emit('errorMessage', failure);
                  }
                }
              } else if (type == 2 || type == 3 || type == 4 || type == 7) {   /////// 2 = image message , 3 = video message ,4 = audio,7= documents
                const media = {};
                const timestamp = common.timestamp();
                let mediaPath;
                if (type == 2) {
                  mediaPath = '/images/';
                } else if (type == 3) {
                  mediaPath = '/videos/';
                }
                else if (type == 4) {
                  mediaPath = '/audios/';
                }
                else if (type == 7) {
                  mediaPath = '/documents/';
                }
                media.messageId = chatMessage.dataValues.id;
                let base64String = data.media;
                base64String = base64String.split(';base64,').pop();
                const dir = config.mediapath + data.groupId
                ///////// if folder of participants not exist then create it with other sub folders ///////////////
                if (!fs.existsSync(dir)) {
                  await Promise.all(
                    config.dirnames.map(async dirname => {
                      await fs.mkdirSync(`${dir}/${dirname}`, { recursive: true })
                    })
                  )
                }
                //////// write base64 string as image,video,audio,document ////////////////
                await fs.writeFile(dir + mediaPath + timestamp + data.extension, base64String, { encoding: 'base64' }, async function (err) {
                  if (err) {
                    const deleteMessage = await chatMessages.destroy({
                      where: {
                        id: chatMessage.dataValues.id
                      }
                    })
                    if (deleteMessage) {
                      return socket.emit('errorMessage', failure);
                    }
                  } else {
                    //////// write thumbnail of image,video or document////////////////
                    const options = {
                      width: 300,
                      height: 200,
                      quality: 100,
                      background: '#fff',
                      keepAspect: true,
                    }
                    if (data.type == 7) {
                      options.pdf = true;  ////////// here we are generating thumb of pdf and for documents such as word,excel we convert them to pdf and then generate thumb of pdf
                      options.pdf_path = dir + mediaPath
                    }
                    if (!filePreview.generateSync(dir + mediaPath + timestamp + data.extension, dir + '/thumbnails/' + timestamp + '.png', options)) {
                    } else {

                      if (data.extension != '.pdf' && data.type == 7) {  //////// remove pdf file generated from other document
                        fs.unlinkSync(dir + mediaPath + timestamp + '.pdf')
                      }
                    };
                  }
                });
                media.media = dir + mediaPath + timestamp + data.extension;
                media.thumbnail = dir + '/thumbnails/' + timestamp + '.png';
                const mediaMessage = await mediaMessages.create(media);
                if (!mediaMessage) {
                  const deleteMessage = await chatMessages.destroy({
                    where: {
                      id: chatMessage.dataValues.id
                    }
                  })
                  if (deleteMessage) {
                    return socket.emit('errorMessage', failure);
                  }
                }
              }

              const requestData = {
                id: chatMessage.dataValues.id,
                groupId: groupId,
                senderId: senderId,
                //  receiverId: data.receiverId,
              };
              if (data.actualMessageId) {
                requestData.actualMessageId = data.actualMessageId

              }
              requestData.usertype = data.usertype;
              const messageDetail = await messageDetails(requestData);
              io.sockets.in(groupId).emit('newMessage', messageDetail); // emit message in room
            }
          }
        })
      } catch (err) {
		  console.log(err,'hello testing');
		if (err.hasOwnProperty('original')) {
          errorMessage = err.original.sqlMessage;
        } else if (err.hasOwnProperty('message')) {
          errorMessage = err.message;
        } else {
          errorMessage = failure;
        }
        return socket.emit('errorMessage', errorMessage);
      }
    })
    /*
    Function to get detail of message sent  
    */
    const messageDetails = async function (requestData) {
      const data = { ...requestData };
      var detail;
      if(requestData.usertype != 'admin'){
        detail = await chatMessages.findOne({
          attributes: ['id', 'senderId','adminId', 'groupId', 'actualMessageId', 'messageType', 'type', 'status', ['createdAt', 'sentAt'],
            [sequelize.fn('IFNULL', sequelize.col('textMessages.message'), ''), 'message'],
            [sequelize.fn('IFNULL', sequelize.col('mediaMessages.media'), ''), 'media'],
            [sequelize.fn('IFNULL', sequelize.col('mediaMessages.thumbnail'), ''), 'thumbnail'],
            [sequelize.literal('user.firstName'), 'senderName'],
            [sequelize.literal('user.image'), 'senderImage'],
          ],
          where: {
            id: data.id
          },
          include: [{
            model: textMessages,
            attributes: [],
          }, {
            model: mediaMessages,
            attributes: [],
          }, {
            model: users,
            attributes: [],
            required: true
          }, {
            model: messagesStatus,
            attributes: ['deliveredAt', 'readAt', 'userId',
              [sequelize.literal('(SELECT image from users where id= userId)'), 'image'],
              [sequelize.literal('(SELECT firstName from users where id= userId)'), 'userName']
            ],
  
            required: true
          }
          ],
        })
      } else{
        detail = await chatMessages.findOne({
          attributes: ['id', 'senderId','adminId', 'groupId', 'actualMessageId', 'messageType', 'type', 'status', ['createdAt', 'sentAt'],
            [sequelize.fn('IFNULL', sequelize.col('textMessages.message'), ''), 'message'],
            [sequelize.fn('IFNULL', sequelize.col('mediaMessages.media'), ''), 'media'],
            [sequelize.fn('IFNULL', sequelize.col('mediaMessages.thumbnail'), ''), 'thumbnail'],
            [sequelize.literal('company.companyName'), 'senderName'],
            [sequelize.literal('company.logo1'), 'senderImage'],
          ],
          where: {
            id: data.id
          },
          include: [{
            model: textMessages,
            attributes: [],
          }, {
            model: mediaMessages,
            attributes: [],
          }, {
            model: companies,
            attributes: [],
            required: true
          }, {
            model: messagesStatus,
            attributes: ['deliveredAt', 'readAt', 'userId',
              [sequelize.literal('(SELECT logo1 from companies where id= userId)'), 'image'],
              [sequelize.literal('(SELECT companyName from companies where id= userId)'), 'userName']
            ],
  
            required: true
          }
          ],
        })
      }
      
      if (detail) {
        ///////////// if person is replying,forwarded  previous message /////////////////// 
        if (data.actualMessageId) {
          const actualMessage = await chatMessages.findOne({
            attributes: ['id', 'senderId', 'groupId', 'type', 'status', ['createdAt', 'sentAt'],
              [sequelize.fn('IFNULL', sequelize.col('textMessages.message'), ''), 'message'],
              [sequelize.fn('IFNULL', sequelize.col('mediaMessages.media'), ''), 'media'],
              [sequelize.fn('IFNULL', sequelize.col('mediaMessages.thumbnail'), ''), 'thumbnail'],
              [sequelize.literal('user.firstName'), 'senderName'],
              [sequelize.literal('user.image'), 'senderImage'],
            ],
            where: {
              id: data.actualMessageId
            },
            include: [{
              model: textMessages,
              attributes: [],
            }, {
              model: mediaMessages,
              attributes: [],
            }, {
              model: users,
              attributes: [],
              required: true
            }
            ],
          })
          actualMessage.dataValues.messageType = detail.dataValues.messageType;
          detail.dataValues.actualMessage = actualMessage;
        } else {
          detail.dataValues.actualMessage = {};
        }
        return detail;
      } else {
        return socket.emit('errorMessage', failure);
      }
    }

    /*
   Get Chat in a specific group   
   */
    socket.on('chatHistory', async (data) => {
      try {
        const authToken = data.authToken;
        const groupId = data.groupId;
        if (!authToken) {
          return socket.emit('errorMessage', 'Please Provide JWT Token');
        }
        if (!groupId) {
          return socket.emit('errorMessage', 'Group is required');
        }
        jwt.verify(authToken, config.jwtToken, async function (err) {
          if (err) {
            return socket.emit('errorMessage', 'Invalid User');
          } else {
            var messages;
            if(data.usertype != 'admin'){
              messages = await chatMessages.findAll({
                attributes: ['id', 'senderId', 'groupId', 'actualMessageId', 'messageType', 'type', 'status', ['createdAt', 'sentAt'],
                  [sequelize.fn('IFNULL', sequelize.col('textMessages.message'), ''), 'message'],
                  [sequelize.fn('IFNULL', sequelize.col('mediaMessages.media'), ''), 'media'],
                  [sequelize.fn('IFNULL', sequelize.col('mediaMessages.thumbnail'), ''), 'thumbnail'],
                  [sequelize.literal('user.firstName'), 'senderName'],
                  [sequelize.literal('user.image'), 'senderImage'],
                ],
                where: {
                  groupId: groupId
                },
                include: [{
                  model: textMessages,
                  attributes: [],
                }, {
                  model: mediaMessages,
                  attributes: [],
                }, {
                  model: users,
                  attributes: [],
                }, {
                  model: messagesStatus,
                  attributes: ['deliveredAt', 'readAt', 'userId',
                    [sequelize.literal('(SELECT image from users where id= userId)'), 'image'],
                    [sequelize.literal('(SELECT firstName from users where id= userId)'), 'userName']
                  ],
                }
                ],
  
              })
            }else{
              messages = await chatMessages.findAll({
                attributes: ['id', 'senderId','adminId', 'groupId', 'actualMessageId', 'messageType', 'type', 'status', ['createdAt', 'sentAt'],
                  [sequelize.fn('IFNULL', sequelize.col('textMessages.message'), ''), 'message'],
                  [sequelize.fn('IFNULL', sequelize.col('mediaMessages.media'), ''), 'media'],
                  [sequelize.fn('IFNULL', sequelize.col('mediaMessages.thumbnail'), ''), 'thumbnail'],
                  [sequelize.literal('company.companyName'), 'adminName'],
                  [sequelize.literal('company.logo1'), 'adminImage'],
                  [sequelize.literal('user.firstName'), 'senderName'],
                  [sequelize.literal('user.image'), 'senderImage'],
                ],
                where: {
                  groupId: groupId
                },
                include: [{
                  model: textMessages,
                  attributes: [],
                }, {
                  model: mediaMessages,
                  attributes: [],
                },{
                  model: users,
                  attributes: [],
                },{
                  model: companies,
                  attributes: [],
                }, {
                  model: messagesStatus,
                  attributes: ['deliveredAt', 'readAt', 'userId',
                    [sequelize.literal('(SELECT logo1 from companies where id= userId)'), 'image'],
                    [sequelize.literal('(SELECT companyName from companies where id= userId)'), 'userName']
                  ],
                }
                ],
  
              })
            }
           
            if (messages) {
              await Promise.all(
                messages.map(async message => {
                  if (message.actualMessageId != 0) {       //  it means this is replied or forwarded message
                    const actualMessage = await chatMessages.findOne({
                      attributes: ['id','senderId' ,'adminId', 'groupId', 'type', 'messageType', 'status', ['createdAt', 'sentAt'],
                        [sequelize.fn('IFNULL', sequelize.col('textMessages.message'), ''), 'message'],
                        [sequelize.fn('IFNULL', sequelize.col('mediaMessages.media'), ''), 'media'],
                        [sequelize.fn('IFNULL', sequelize.col('mediaMessages.thumbnail'), ''), 'thumbnail'],
                        [sequelize.literal('user.firstName'), 'senderName'],
                        [sequelize.literal('user.image'), 'senderImage'],
                      ],
                      where: {
                        id: message.actualMessageId
                      },
                      include: [{
                        model: textMessages,
                        attributes: [],
                      }, {
                        model: mediaMessages,
                        attributes: [],
                      }, {
                        model: users,
                        attributes: [],
                      }
                      ],
                    })
                    if (actualMessage) {
                      message.dataValues.actualMessage = actualMessage;
                    }
                  } else {
                    message.dataValues.actualMessage = {};
                  }
                })
              )   

              const sortMessages = await messages.slice().sort((a, b) => a.dataValues.sentAt - b.dataValues.sentAt); //// sort message array in asc order of message sent
              socket.emit('chatHistoryRes',sortMessages )
              socket.emit('chatHistory',sortMessages )
            } else {
              socket.emit('chatHistoryRes',[] )

              socket.emit('chatHistory', [])
            }
          }
        })
      } catch (err) {
        if (err.hasOwnProperty('original')) {
          errorMessage = err.original.sqlMessage;
        } else if (err.hasOwnProperty('message')) {
          errorMessage = err.message;
        } else {
          errorMessage = failure;
        }
        return socket.emit('errorMessage', errorMessage);
      }

    })


    /*
    Get Chat in a specific group   
    */
    socket.on('chatList', async (data) => {
      try {
        const authToken = data.authToken;
        if (!authToken) {
          return socket.emit('errorMessage', 'Please Provide JWT Token');
        }
        jwt.verify(authToken, config.jwtToken, async function (err) {
          if (err) {
            return socket.emit('errorMessage', 'Invalid User');
          } else {
            const senderId = await common.userId(authToken);

            const groupsM= await groupMembers.findAll({
              attributes: ['groupId'],
              where: {
                userId: senderId
              }
            })

            if(groupsM) {
              const messages = [];
              await Promise.all(
                groupsM.map(async group => {
                  const groupDetail = await groupa.findOne({
                    attributes: ['groupName','groupIcon','createdBy','createdAt'],
                    where: {
                      id: group.groupId
                    },
                    include: [
               
                      {
                        model: groupMembers,
                        attributes: ['userId'],
                      }
                    ]
                  })
                  var message;
                  if(data.usertype != "admin"){
                    message = await chatMessages.findOne({
                      attributes: ['id', 'senderId', 'groupId', 'actualMessageId', 'messageType', 'type', 'status', ['createdAt', 'sentAt'],
                        [sequelize.fn('IFNULL', sequelize.col('textMessages.message'), ''), 'message'],
                        [sequelize.fn('IFNULL', sequelize.col('mediaMessages.media'), ''), 'media'],
                        [sequelize.fn('IFNULL', sequelize.col('mediaMessages.thumbnail'), ''), 'thumbnail'],
                        [sequelize.literal('user.firstName'), 'senderName'],
                        [sequelize.literal('user.image'), 'senderImage'],
                        [sequelize.literal('group.groupName'), 'groupName'],
                        [sequelize.literal('group.groupIcon'), 'groupIcon'],
                        [sequelize.literal('group.createdBy'), 'createdBy']
  
                      ],
                      subQuery: false,
  
                      where: {
                       groupId: group.groupId
                      },
                      order: [
                        ['id', 'DESC']
                       ],
                      
                      include: [
                 
                        {
                          model: groupa,
                          attributes: [],
                        },
                        {
                          model: textMessages,
                          attributes: [],
                        },
                        {
                          model: groupMembers,
                          attributes: ['userId'],
                        }, {
                          model: mediaMessages,
                          attributes: [],
                        }, {
                          model: users,
                          attributes: [],
                          required: true
                        }, {
                          model: messagesStatus,
                          attributes: ['deliveredAt', 'readAt', 'userId',
                            [sequelize.literal('(SELECT image from users where id= messagesStatuses.userId)'), 'image'],
                            [sequelize.literal('(SELECT firstName from users where id= messagesStatuses.userId)'), 'userName']
                          ],
                          required: true
                        }
                      ],
                    })
                    
                  } else{
                    message = await chatMessages.findOne({
                      attributes: ['id', 'adminId', 'groupId', 'actualMessageId', 'messageType', 'type', 'status', ['createdAt', 'sentAt'],
                        [sequelize.fn('IFNULL', sequelize.col('textMessages.message'), ''), 'message'],
                        [sequelize.fn('IFNULL', sequelize.col('mediaMessages.media'), ''), 'media'],
                        [sequelize.fn('IFNULL', sequelize.col('mediaMessages.thumbnail'), ''), 'thumbnail'],
                        [sequelize.literal('company.companyName'), 'adminName'],
                        [sequelize.literal('company.logo1'), 'adminImage'],
                        [sequelize.literal('user.firstName'), 'senderName'],
                        [sequelize.literal('user.image'), 'senderImage'],
                        [sequelize.literal('group.groupName'), 'groupName'],
                        [sequelize.literal('group.groupIcon'), 'groupIcon'],
                        [sequelize.literal('group.createdBy'), 'createdBy']
  
                      ],
                      subQuery: false,
  
                      where: {
                       groupId: group.groupId
                      },
                      order: [
                        ['id', 'DESC']
                       ],
                      
                      include: [
                 
                        {
                          model: groupa,
                          attributes: [],
                        },
                        {
                          model: textMessages,
                          attributes: [],
                        },
                        {
                          model: groupMembers,
                          attributes: ['userId'],
                        }, {
                          model: mediaMessages,
                          attributes: [],
                        },
                        {
                          model: users,
                          attributes: [],
                        },
                         {
                          model: companies,
                          attributes: [],
                          required: true
                        }, {
                          model: messagesStatus,
                          attributes: ['deliveredAt', 'readAt', 'userId',
                            [sequelize.literal('(SELECT logo1 from companies where id= chatMessages.adminId)'), 'image'],
                            [sequelize.literal('(SELECT companyName from companies where id= chatMessages.adminId)'), 'userName']
                          ],
                          required: true
                        }
                      ],
                    })
                  }
                  

                if(message) {
                  message.dataValues.groupMember = groupDetail.dataValues.groupMembers;
                  message.dataValues.actualMessage = {}
                  messages.push(message)
                } else {
              
                messages.push({
                    "id": "",
                    "senderId": "",
                    "groupId": group.groupId,
                    "actualMessageId": "0",
                    "messageType": 0,
                    "type": 0,
                    "status": 0,
                    "sentAt": groupDetail.dataValues.createdAt,
                    "message": "",
                    "media": "",
                    "thumbnail": "",
                    "senderName": "",
                    "senderImage": "",
                    "groupName": groupDetail.dataValues.groupName,
                    "groupIcon": groupDetail.dataValues.groupIcon,
                    "groupMember": groupDetail.dataValues.groupMembers,
                    "messagesStatuses": [],
                    "createdBy": groupDetail.dataValues.createdBy,
                    "actualMessage": {}
                })
                }
                })
              )
         
            if (messages) {
              await Promise.all(
                messages.map(async message => {
                //  message.actualMessage = {}
                 // console.log(message)
                  if (message.actualMessageId != 0) {       //  it means this is replied or forwarded message
                    const actualMessage = await chatMessages.findOne({
                      attributes: ['id', 'senderId', 'groupId', 'type', 'messageType', 'status', ['createdAt', 'sentAt'],
                        [sequelize.fn('IFNULL', sequelize.col('textMessages.message'), ''), 'message'],
                        [sequelize.fn('IFNULL', sequelize.col('mediaMessages.media'), ''), 'media'],
                        [sequelize.fn('IFNULL', sequelize.col('mediaMessages.thumbnail'), ''), 'thumbnail'],
                        [sequelize.literal('user.firstName'), 'senderName'],
                        [sequelize.literal('user.image'), 'senderImage'],
                      ],
                      where: {
                        id: message.actualMessageId
                      },
                      include: [{
                        model: textMessages,
                        attributes: [],
                      }, {
                        model: mediaMessages,
                        attributes: [],
                      }, {
                        model: users,
                        attributes: [],
                        required: true
                      },
                       {
                        model: groupa,
                        attributes: ['groupName'],
                      },
                      ],
                    })
                    if (actualMessage) {
                      message.dataValues.actualMessage = actualMessage;
                    }
                  } 
                 else {
                  // console.log(message)
                   message.actualMessage = {};
                 
                 }
                 if(message.sentAt) {
                   message.actualTime = message.sentAt;
                 }
                 if(message.dataValues) {
                  message.actualTime = message.dataValues.sentAt;
                 }

                })
              )
             let sortMessages = await messages.slice().sort(
               (a, b) => b.actualTime - a.actualTime); //// sort message array in asc order of message sent
              socket.emit('chatListRes',sortMessages )
              socket.emit('chatList', sortMessages)

            }

            } else {
              socket.emit('chatList', [])

            }

          }
        })
      } catch (e) {
        if (err.hasOwnProperty('original')) {
          errorMessage = err.original.sqlMessage;
        } else if (err.hasOwnProperty('message')) {
          errorMessage = err.message;
        } else {
          errorMessage = failure;
        }
        return socket.emit('errorMessage', errorMessage);
      }

    })

    /*
    change message status to delivered 
  */

    socket.on('deliveredMessage', async (data) => {
      try {
        const { authToken, messageId, groupId } = data;

        if (!authToken) {
          return socket.emit('errorMessage', 'Please Provide JWT Token');
        }
        if (!messageId) {
          return socket.emit('errorMessage', 'Message is required');
        }
        if (!groupId) {
          return socket.emit('errorMessage', 'Group is required');
        }
        jwt.verify(authToken, config.jwtToken, async function (err) {
          if (err) {
            return socket.emit('errorMessage', 'Invalid User');
          } else {
            const senderId = await common.userId(authToken);
            const message = await messagesStatus.findOne({
              attributes: ['id'],
              where: {
                messageId: messageId
              }
            })
			
            const updateMessage = await chatMessages.update({
              status: 2,                     ////////////// 2 = delivered
            }, {
              where: {
                id: {
                  [Op.lte]: messageId
                },
                senderId: {
                  [Op.ne]: senderId
                },
                groupId: groupId
              }
            })
			if(message){
            const update = await messagesStatus.update({
              deliveredAt: common.timestamp(),
              updatedAt: common.timestamp()
            },
              {
                where: {
                  id: {
                    [Op.lte]: message.dataValues.id
                  },
                  userId: senderId
                }
              })
			}else{
				return socket.emit('errorMessage', 'Invalid Message ID');
			}	
            socket.broadcast.to(groupId).emit('deliveredMessage', { messageId: messageId });
          }
        })
      } catch (e) {
        if (err.hasOwnProperty('original')) {
          errorMessage = err.original.sqlMessage;
        } else if (err.hasOwnProperty('message')) {
          errorMessage = err.message;
        } else {
          errorMessage = failure;
        }
        return socket.emit('errorMessage', errorMessage);
      }
    })


    /*
     change message status to read 
   */

    socket.on('readMessage', async (data) => {
      try {
        const { authToken, messageId, groupId } = data;

        if (!authToken) {
          return socket.emit('errorMessage', 'Please Provide JWT Token');
        }
        if (!messageId) {
          return socket.emit('errorMessage', 'Message is required');
        }
        if (!groupId) {
          return socket.emit('errorMessage', 'Group is required');
        }
        jwt.verify(authToken, config.jwtToken, async function (err) {
          if (err) {
            return socket.emit('errorMessage', 'Invalid User');
          } else {
            const senderId = await common.userId(authToken);
            const message = await messagesStatus.findOne({
              attributes: ['id'],
              where: {
                messageId: messageId
              }
            })

            const updateMessage = await chatMessages.update({
              status: 3,                     ////////////// 3 = read
            }, {
              where: {
                id: {
                  [Op.lte]: messageId
                },
                senderId: {
                  [Op.ne]: senderId
                },
                groupId: groupId
              }
            })
            const update = await messagesStatus.update({
              readAt: common.timestamp(),
              updatedAt: common.timestamp()
            },
              {
                where: {
                  id: {
                    [Op.lte]: message.dataValues.id
                  },
                  userId: senderId
                }
              })
            socket.broadcast.to(groupId).emit('readMessage', { messageId: messageId });
          }
        })
      } catch (e) {
        if (err.hasOwnProperty('original')) {
          errorMessage = err.original.sqlMessage;
        } else if (err.hasOwnProperty('message')) {
          errorMessage = err.message;
        } else {
          errorMessage = failure;
        }
        return socket.emit('errorMessage', errorMessage);
      }
    })
    /*
    Clear Chat in a specific group by specific user 
    */
    socket.on('clearChat', async (data) => {
      try {
        const chatExists = await clearedMessages.findOne({
          attributes: ['id'],
          where: {
            groupId: data.groupId,
            userId: data.userId
          }
        })
        if (chatExists) {
          const update = await clearedMessages.update({
            messageId: data.messageId,
            updatedAt: common.timestamp()
          },
            {
              returning: true,
              where: {
                id: chatExists.dataValues.id
              }
            })
          if (update) {
            socket.emit('clearChat', { message: 'Chat Cleared!!!' })
          }
        } else {
          const clearData = {};
          clearData.groupId = data.groupId;
          clearData.userId = data.userId;
          clearData.messageId = data.messageId;
          const clear = await clearedMessages.create(clearData);
          if (clear) {
            socket.emit('clearChat', { message: 'Chat Cleared!!!' })
          }
        }
      } catch (err) {
        if (err.hasOwnProperty('original')) {
          errorMessage = err.original.sqlMessage;
        } else if (err.hasOwnProperty('message')) {
          errorMessage = err.message;
        } else {
          errorMessage = failure;
        }
        return socket.emit('errorMessage', errorMessage);
      }
    })
  })
}    