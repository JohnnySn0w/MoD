module.exports.ITEM_CONSTANT = (item, equippable = false) => { 
  equippable ?
    {
      'name': item.name,
      'type': item.type,
      'equipped': false,
      'stats': item.stats,
      'amount': 1,
      'id': item.id
    } :
    {
      'name': item.name,
      'type': item.type,
      'stats': item.stats,
      'amount': 1,
      'id': item.id
    };
};