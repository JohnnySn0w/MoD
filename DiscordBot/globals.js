const DEBUG = true;

function deleteMessage(message) {
// delete the user's command if not debugging
  if (!DEBUG) {
    message.delete();
  }
}

module.exports = { 
  DEBUG,
  deleteMessage
};