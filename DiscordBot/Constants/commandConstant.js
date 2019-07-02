module.exports.COMMAND_CONSTANT = (name, info, prompt = false, aliases = []) => { 
  return (prompt ?
    {
      name: name,
      group: 'mud',
      memberName: name,
      description: info,
      aliases: aliases,
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
      aliases: aliases,
      memberName: name,
      description: info,
    });
};