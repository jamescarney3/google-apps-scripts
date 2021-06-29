// 'from' properties here match senders, 'label' properties here match
// the labels in my own gmail account - if anyone else were to adapt this
// for personal use this is where you'd put the senders and labels you
// want to auto-file
const SENDERS = {
  CIRCLE_CI: { from: '<builds@circleci.com>', label: 'CircleCI' },
  GITHUB: { from: '<notifications@github.com>', label: 'GitHub' },
};

// match a terminal string in an email sender address that starts and ends
// with angle bracks and where intervening content matches an email format
const GMAIL_FROM_SIGNATURE = /<.*@.*\..*>$/;

// add a label, mark the thread as read, archive it, and hit the logs
const processMessage = (message, thread, label) => {
  thread.addLabel(label);
  thread.markRead();
  thread.moveToArchive();
  Logger.log('successfully labeled and archived: ' + message.getSubject());
}

const labelAndArchive = () => {
  const threads = GmailApp.getInboxThreads();
  threads.forEach((thread) => {
    // get the message that originated a thread
    const firstMessage = thread.getMessages()[0];

    // get the sender address from that message, match it against a terminal
    // <address@name.extension> regex
    const match = firstMessage.getFrom().match(GMAIL_FROM_SIGNATURE);

    // exit early if we don't find anything that matches the signature regex,
    // can't imagine that this would happen, but don't want this to fail if
    // it does
    if (!match) return;

    // based on what matched, determine if it's from a sender whose emails
    // I want to file, get a label from the hash, and the process the thread
    switch (match[0]) { // first element in the .match array is the match
      case SENDERS.GITHUB.from: { // explicitly scope this in order to shadow 'label'
        const label = GmailApp.getUserLabelByName(SENDERS.GITHUB.label);
        processMessage(firstMessage, thread, label);
      }
      case SENDERS.CIRCLE_CI.from: { // these cases are short enough I don't mind shadowing
        const label = GmailApp.getUserLabelByName(SENDERS.CIRCLE_CI.label);
        processMessage(firstMessage, thread, label);
      }
    }
  });
};
