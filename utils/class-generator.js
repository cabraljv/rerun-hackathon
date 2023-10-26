const fs = require('fs');
const types = require('./types');


exports.compile = async (ast, output) => {
  const knex = require('knex')({
    client: 'sqlite3',
    connection: {
      filename: `${output}/database.sqlite`
    }
  });
  	// sort ast by relation, a class that has a relation with another class must be generated after the class it has a relation with
    ast.sort((a, b) => {
      if(a.relationsWith.includes(b.name)){
        return 1;
      }
      if(b.relationsWith.includes(a.name)){
        return -1;
      }
      return 0;
    }
    )

  for(const item of ast){

    console.log('Generating class and table for', item.name)
    const classFile = generateClassFile(item);
    
    await knex.raw(generateSQLiteCreateTable(item));

    fs.writeFileSync(`${output}/${item.name}.js`, classFile)
  }
}

function generateSQLiteCreateTable(astItem){
  const { name, fields } = astItem;
  const createTable = `
  CREATE TABLE ${name} (
    ${fields.map(field => generateField(field)).join(', ')}
  );
  `;
  
  return createTable;
}

function generateField(field){
  if(Object.keys(types).includes(field.type)){
    return `${field.name} ${types[field.type]}`;
  }
  // is a reference to another class so we need to create a foreign key
  return `${field.name}_id INTEGER REFERENCES ${field.type}(id)`;

}


function generateClassFile(astItem){
  const { name, fields, customCode } = astItem;
  const classFile = `
  const knex = require('knex')({
    client: 'sqlite3',
    connection: {
      filename: './database.sqlite'
    }
  });
  class ${name} ${astItem.extends ? `extends ${astItem.extends}` : ''}{
    ${generateConstructor(fields)}
    ${fields.map(field => generateGetSetter(field)).join('\n')}
    ${generateCrud(astItem)}
    ${customCode}
  }
  module.exports = ${name};
  `;
  return classFile;
}

function generateConstructor(fields){
  const constructor = `
  constructor(${fields.map(field => `${field.name}`)}){
    ${
      fields.map(field => `this._${field.name} = ${field.name}`).join('\n')
    }
  }
  constructor(id){
    this.id = id;
  }
  `;
  return constructor;
}

function generateGetSetter(field){
  const getSetter = `
  get ${field.name}(){
    return this._${field.name};
  }
  set ${field.name}(${field.name}){
    this._${field.name} = ${field.name};
  }
  `;
  return getSetter;
}


function generateCrud(astItem){
  // generate all crud methods using knex
  // generate create method
  const createMethod = `
  async save(){
    const id = await knex('${astItem.name}').insert(this);
    this.id = id;
    return this;
  }
  `;
  // generate read method
  const readMethod = `
  async read(){
    const result = await knex('${astItem.name}').where({ id: this.id });
    ${astItem.fields.map(field => `this.${field.name} = result.${field.name}`).join('\n')}
  }
  `;

  // generate update method
  const updateMethod = `
  async update(){
    await knex('${astItem.name}').where({ id: this.id }).update(this);
    return this;
  }
  `;

  // generate delete method
  const deleteMethod = `
  async delete(){
    await knex('${astItem.name}').where({ id: this.id }).delete();
  }
  `;

  return `
  ${createMethod}
  ${readMethod}
  ${updateMethod}
  ${deleteMethod}
  `;

}