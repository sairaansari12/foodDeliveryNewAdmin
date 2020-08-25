/* jshint indent: 2 */
const common = require('../../helpers/common');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('instructions', {
    id: {
      type: DataTypes.INTEGER(10),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },


    deliveryInstructions:
    {
      type: DataTypes.TEXT,
      allowNull: false,
      get() {
       if(this.getDataValue('deliveryInstructions')!="") 
       return JSON.parse(this.getDataValue('deliveryInstructions'))
       else return ""
    },
      defaultValue: ""
    },

    pickupInstructions:
    {
      type: DataTypes.TEXT,
      allowNull: false,
      get() {
        if(this.getDataValue('pickupInstructions')!="") 
        return JSON.parse(this.getDataValue('pickupInstructions'))
        else return ""
    },
      defaultValue: ""
    },


    cookingInstructions: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: ""
    },



    tips:
    {
      type: DataTypes.TEXT,
      allowNull: false,
      get() {
        if(this.getDataValue('tips')!="") 
        return JSON.parse(this.getDataValue('tips'))
        else return ""
    },
      defaultValue: ""
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
  
      
    status: {
      type: DataTypes.INTEGER(10),
      allowNull: false,
      defaultValue: 1
    },
    
    createdAt: {
      type: DataTypes.DATE(),
      allowNull: false,
      defaultValue: new Date()
    }
  }, {
    tableName: 'instructions',
    timestamps: false
  });
};
