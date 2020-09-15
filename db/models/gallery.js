/* jshint indent: 2 */
const common = require('../../helpers/common');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('gallery', {
    id: {
      type: DataTypes.INTEGER(10),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
      
    },
    mediaType: {
        type: DataTypes.STRING(256),
        allowNull: false,
    },

   
   

    
    mediaUrl: {
      type: DataTypes.TEXT,
      allowNull: false,
      get() {
        if(this.getDataValue('mediaUrl') && this.getDataValue('mediaUrl')!="")
        {
          var images=this.getDataValue('mediaUrl').split(",")
          imageArray=[];
          for(var k=0;k<images.length;k++)
          {
            imageArray.push(images[k]);
          }
          return  imageArray;
        }
        else return []

    },
      defaultValue: ""
    },

    mediaHttpUrl: {
      type: DataTypes.TEXT,
      allowNull: false,
      get() {
        if(this.getDataValue('mediaHttpUrl') && this.getDataValue('mediaHttpUrl')!="")
        {
          var images=this.getDataValue('mediaHttpUrl').split(",")
          imageArray=[];
          for(var k=0;k<images.length;k++)
          {
            imageArray.push( config.IMAGE_APPEND_URL+"gallery/"+images[k]);
          }
          return  imageArray;
        }
        else return []

    },
      defaultValue: ""
    },


    title: {
      type: DataTypes.STRING(256),
      allowNull: false,
  },

  description: {
    type: DataTypes.TEXT(),
    allowNull: false,
},

    companyId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'companies',
        key: 'id'
       },
       onUpdate: 'CASCADE',
       onDelete: 'CASCADE',
    },

    userId: {
        type: DataTypes.STRING(100),
        allowNull: false,
        defaultValue: ''
    },

    status: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: 0
    },

    
    createdAt: {
      type: DataTypes.DATE(),
      allowNull: false,
      defaultValue: new Date()
    },
    updatedAt: {
      type: DataTypes.DATE(),
      allowNull: false,
      defaultValue: new Date()
    }
  }, {
    tableName: 'gallery',
    timestamps: false
  });
};
