module.exports.COMMAND_CONSTANT = (name, info, prompt = false, aliases = [], userPermissions = [], args = []) => { 
  return (prompt ?
    {
      name: name,
      group: 'mud',
      memberName: name,
      description: info,
      aliases: aliases,
      userPermissions: userPermissions,
      args: args,
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