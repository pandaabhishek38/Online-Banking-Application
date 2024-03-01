const http = require('http');
const url = require('url');
const Customer = require('../models/customer');
const sendEmail = require('../config/email.js');


const reportCardController = {
    // Function to fetch card details and prompt for confirmation

    fetchDebitCardDetails: function(req, res) {
        const customerId = req.customerId; 
        console.log("Customer Id: " + customerId)

        Customer.fetchDebitCardDetails(customerId, (error, cardDetails) => {
            if (error) {
                console.error('Fetching card details failed:', error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Fetching card details failed', error }));
            } else {
                if (!cardDetails) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Card details not found' }));
                } else {
                    console.log("Card details: " + cardDetails)
                    console.log("Card details: " + JSON.stringify(cardDetails));
                    console.log("Card details:", JSON.stringify(cardDetails, null, 2));


                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true, data: cardDetails }));
                }
            }
        });
    },

    reportCard: function (req, res) {
        try {
            const parsedUrl = url.parse(req.url, true);
            const cardId = parsedUrl.query.cardId;
            
            Customer.getCardNumberByCardId(cardId, (error, cardNumber) => {
                if (error) {
                    console.error('Fetching card number failed:', error);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Fetching card number failed', error }));
                } else {
                    if (!cardNumber) {
                        res.writeHead(404, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ message: 'Card number not found' }));
                    } else {
                        const cardNumberObj = cardNumber[0]; 
                        if (cardNumberObj && cardNumberObj.Card_Number) {
                            const lastFourDigits = cardNumberObj.Card_Number.slice(-4); // Extracting the last 4 digits
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ success: true, message: `Are you sure you want to report the card ending with ${lastFourDigits}?`, data: { cardId} }));//, cardNumber: cardNumberObj.Card_Number } }));
                        } else {
                            // Handle the case where card number is not found or the structure is not as expected
                            res.writeHead(404, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ message: 'Card number not found or invalid format' }));
                        }
                    }
                }
            });
        } catch (error) {

            console.error('Fetching card number failed2:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Fetching card number failed', error }));
        }
    },


    confirmReportCard: function (req, res) {
        let body = '';
    
        req.on('data', chunk => {
            body += chunk.toString(); 
        });
    
        req.on('end', async () => {
            try {
                const requestData = JSON.parse(body);
                const cardId = requestData['cardId'];
    
                if (!cardId) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Missing cardId in the request body' }));
                    return;
                }
    
                // Retrieve the card status first to make sure it's active
                Customer.getCardStatus(cardId, async (statusError, currentStatus) => {
                    if (statusError) {
                        console.error('Fetching card status failed:', statusError);
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ message: 'Fetching card status failed', error: statusError }));
                        return;
                    }
    
                    if (currentStatus !== 1) {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Card is either already inactive or not found' }));
                        return;
                    }
    
                    // Retrieve the card number for the last four digits
                    Customer.getCardNumberByCardId(cardId, async (cardError, cardNumberResult) => {
                        if (cardError || !cardNumberResult.length) {
                            console.error('Fetching card number failed:', cardError);
                            res.writeHead(500, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ message: 'Fetching card number failed', error: cardError }));
                            return;
                        }
    
                        const cardNumberObj = cardNumberResult[0];
                        const lastFourDigits = cardNumberObj.Card_Number.slice(-4);
    
                        // Retrieve the user email to send confirmation
                        Customer.getEmailByCardId(cardId, async (emailError, emailResult) => {
                            if (emailError || !emailResult.length) {
                                console.error('Fetching email failed:', emailError);
                                res.writeHead(500, { 'Content-Type': 'application/json' });
                                res.end(JSON.stringify({ message: 'Fetching email failed', error: emailError }));
                                return;
                            }
                            const userEmail = emailResult[0].email;
                            // Update the card status
                            Customer.updateCardStatus(cardId, 0, async (updateError, updateResult) => {
                                if (updateError) {
                                    console.error('Card status update failed:', updateError);
                                    res.writeHead(500, { 'Content-Type': 'application/json' });
                                    res.end(JSON.stringify({ message: 'Card status update failed', error: updateError }));
                                    return;
                                }
    
                                // Send an email to the user
                                try {
                                    await sendEmail(
                                        userEmail,
                                        'Card Reported',
                                        `Your card ending in ****${lastFourDigits} has been reported successfully.`,
                                        `<p>Your card ending in ****${lastFourDigits} has been reported successfully.</p>`
                                    );
    
                                    res.writeHead(200, { 'Content-Type': 'application/json' });
                                    res.end(JSON.stringify({ success: true, message: `Card ending in ****${lastFourDigits} reported and email sent successfully`, data: { cardId } }));
                                } catch (emailError) {
                                    console.error('Email sending failed:', emailError);
                                    res.writeHead(500, { 'Content-Type': 'application/json' });
                                    res.end(JSON.stringify({ message: 'Card status updated but email sending failed', error: emailError }));
                                }
                            });
                        });
                    });
                });
            } catch (error) {
                console.error('Error parsing request body:', error);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Error parsing request body', error }));
            }
        });
    },
    

    deleteCard: function (req, res) {
        let body = '';
    
        req.on('data', chunk => {
            body += chunk.toString(); // Convert buffer to string
        });
    
        req.on('end', async () => {
            try {
                const requestData = JSON.parse(body);
                const cardId = requestData['cardId'];
    
                if (!cardId) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Missing cardId in the request body' }));
                    return;
                }
    
                // Fetch the card number for the confirmation message
                Customer.getCardNumberByCardId(cardId, async (cardError, cardNumberResult) => {
                    if (cardError || !cardNumberResult.length) {
                        console.error('Fetching card number failed:', cardError);
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ message: 'Fetching card number failed', error: cardError }));
                        return;
                    }
                    const lastFourDigits = cardNumberResult[0].Card_Number.slice(-4);
    
                    // Check the current card status
                    Customer.getCardStatus(cardId, async (statusError, currentStatus) => {
                        if (statusError) {
                            console.error('Fetching card status failed:', statusError);
                            res.writeHead(500, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ message: 'Fetching card status failed', error: statusError }));
                            return;
                        }
    
                        if (currentStatus !== 0) {
                            res.writeHead(400, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ error: 'Card is either active or already deleted' }));
                            return;
                        }
    
                        // Fetch the email address associated with the cardId
                        Customer.getEmailByCardId(cardId, async (emailError, emailResult) => {
                            if (emailError || !emailResult.length) {
                                console.error('Fetching email failed:', emailError);
                                res.writeHead(500, { 'Content-Type': 'application/json' });
                                res.end(JSON.stringify({ message: 'Fetching email failed', error }));
                                return;
                            }
                            const userEmail = emailResult[0].email;
    
                            // Update the card status to 2 (deleted)
                            Customer.updateCardStatus(cardId, 2, async (updateError, updateResult) => {
                                if (updateError) {
                                    console.error('Card deletion failed:', updateError);
                                    res.writeHead(500, { 'Content-Type': 'application/json' });
                                    res.end(JSON.stringify({ message: 'Card deletion failed', error: updateError }));
                                    return;
                                }
    
                                // Send an email to the user to notify them of the deletion
                                try {
                                    await sendEmail(
                                        userEmail,
                                        'Card Deletion Confirmation',
                                        `Your card ending in ****${lastFourDigits} has been deleted successfully.`,
                                        `<p>Your card ending in ****${lastFourDigits} has been deleted successfully.</p>`
                                    );
    
                                    res.writeHead(200, { 'Content-Type': 'application/json' });
                                    res.end(JSON.stringify({ success: true, message: `Card ending in ****${lastFourDigits} deleted and email sent successfully`, data: { cardId } }));
                                } catch (emailError) {
                                    console.error('Email sending failed:', emailError);
                                    res.writeHead(500, { 'Content-Type': 'application/json' });
                                    res.end(JSON.stringify({ success: true, message: 'Card deleted but email sending failed', error: emailError }));
                                }
                            });
                        });
                    });
                });
            } catch (error) {
                console.error('Error parsing request body:', error);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Error parsing request body', error }));
            }
        });
    },
    
    reactivateCard: function (req, res) {
        let body = '';
    
        req.on('data', chunk => {
            body += chunk.toString(); // Convert Buffer to string
        });
    
        req.on('end', async () => {
            try {
                const requestData = JSON.parse(body);
                const cardId = requestData['cardId'];
                console.log("Request data for reactivate: " + requestData)
                console.log("Request data for reactivate: " + JSON.stringify(requestData));
                if (!cardId) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Missing cardId in the request body' }));
                    return;
                }
    
                Customer.getCardStatus(cardId, async (statusError, currentStatus) => {
                    if (statusError) {
                        console.error('Fetching card status failed:', statusError);
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ message: 'Fetching card status failed', error: statusError }));
                        return;
                    }
    
                    if (currentStatus !== 0) {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Card is either active or deleted'}));
                        return;
                    }
    
                    // Retrieve the last four digits of the card number
                    Customer.getCardNumberByCardId(cardId, async (cardError, cardNumberResult) => {
                        if (cardError || !cardNumberResult.length) {
                            console.error('Fetching card number failed:', cardError);
                            res.writeHead(500, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ message: 'Fetching card number failed', error: cardError }));
                            return;
                        }
    
                        const cardNumberObj = cardNumberResult[0];
                        const lastFourDigits = cardNumberObj.Card_Number.slice(-4);
    
                        // Fetch the email address associated with the cardId
                        Customer.getEmailByCardId(cardId, async (emailError, emailResult) => {
                            if (emailError || !emailResult.length) {
                                console.error('Fetching email failed:', emailError);
                                res.writeHead(500, { 'Content-Type': 'application/json' });
                                res.end(JSON.stringify({ message: 'Fetching email failed', error }));
                                return;
                            }
                            const userEmail = emailResult[0].email;
    
                            // Update the card status to 1 (reactivated)
                            Customer.updateCardStatus(cardId, 1, async (updateError, updateResult) => {
                                if (updateError) {
                                    console.error('Card reactivation failed:', updateError);
                                    res.writeHead(500, { 'Content-Type': 'application/json' });
                                    res.end(JSON.stringify({ message: 'Card reactivation failed', error: updateError }));
                                    return;
                                }
    
                                // Send an email to the user to notify them of the reactivation
                                try {
                                    await sendEmail(
                                        userEmail,
                                        'Card Reactivation Confirmation',
                                        `Your card ending in ****${lastFourDigits} has been reactivated successfully.`,
                                        `<p>Your card ending in ****${lastFourDigits} has been reactivated successfully.</p>`
                                    );
    
                                    res.writeHead(200, { 'Content-Type': 'application/json' });
                                    res.end(JSON.stringify({ success: true, message: `Card ending in ****${lastFourDigits} reactivated and email sent successfully`, data: { cardId } }));
                                } catch (emailError) {
                                    console.error('Email sending failed:', emailError);
                                    res.writeHead(500, { 'Content-Type': 'application/json' });
                                    res.end(JSON.stringify({ message: 'Card reactivated but email sending failed', error: emailError }));
                                }
                            });
                        });
                    });
                });
            } catch (error) {
                console.error('Error parsing request body:', error);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Error parsing request body', error }));
            }
        });
    }
    
    
    

};

module.exports = reportCardController;