const types = require('./types');

exports.generateAst = (input) => {

  const lines = input.split('\n');
  const ast = [];
  let currentStruct = null;
  let isInCustomCode = false;
  for(const line of lines){
    const structRegex = /struct/g;
    const attributeRegex = /attribute/g;

    if(isInCustomCode){
      if(line.includes('*/')){
        isInCustomCode = false;
        continue
      }
      currentStruct.customCode += line;
      continue;
    }

    if(structRegex.test(line)){
      const structName = line.trim().split('struct')[1].trim().split(' ')[0];
      if(line.includes('extends')){
        const extendsName = line.split('extends')[1];
        const alreadyDeclaredExtends = ast.find(item => item.name === extendsName.trim());

        currentStruct = {
          name: structName.trim(),
          extends: extendsName.trim(),
          customCode: '',
          relationsWith: [],
          fields: alreadyDeclaredExtends?.fields || []
        }
        continue;
      }
      currentStruct = {
        name: structName.trim(),
        customCode: '',
        relationsWith: [],
        fields: []
      }
    }
    if(line.includes('/*')){
      isInCustomCode=true;

    }
    if(attributeRegex.test(line)){
      const attributeName = line.trim().split(' ')[2];
      const attributeType = line.trim().split(' ')[1];

      if(!Object.keys(types).includes(attributeType)){
        currentStruct.relationsWith.push(attributeType);
      }
      currentStruct.fields.push({
        name: attributeName,
        type: attributeType
      })
    }
    if(line.includes('}')){
      ast.push(currentStruct);
      for(const item of ast){
        if(item.extends === currentStruct.name){
          item.fields = item.fields.concat(currentStruct.fields);
        }
      }
      currentStruct = null;
    }
    // verify if the line is a struct
    
    
  }
  return ast
}