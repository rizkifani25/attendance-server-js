exports.logger = (message) => {
    console.log('[LOG]\t :: ' + message.toString());
};

exports.info = (message) => {
    console.info('[INFO]\t :: ' + message);
};