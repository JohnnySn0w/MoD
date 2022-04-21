module.exports.COMMAND_CONSTANT = (name, info, prompt = false, aliases = [], userPermissions = []) => { 
  return (prompt ?
    {
      name: name,
      group: 'mud',
      memberName: name,
      description: info,
      aliases: aliases,
      userPermissions: userPermissions,
      args: [
        {
          key: 'object',
          prompt: `What are you trying to ${name}?`,
          type: 'string'
        }
      ],
    } :
    {
      name: name,
      group: 'mud',
      aliases: aliases,
      memberName: name,
      description: info,
      userPermissions: userPermissions,
    });
};