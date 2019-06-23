module.exports.COMMAND_CONSTANT = (name, info, prompt = false) => { 
  return (prompt ?
    {
      name: name,
      group: 'mud',
      memberName: name,
      description: info,
      args: [
        {
          key: 'object',
          prompt: `What are you trying to ${name}?`,
          type: 'string'
        }
      ]
    } :
    {
      name: name,
      group: 'mud',
      memberName: name,
      description: info,
    });
};