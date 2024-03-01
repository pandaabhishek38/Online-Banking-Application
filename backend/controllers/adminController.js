const url = require('url');
const Admin = require('../models/admin');


const adminController = {

    //UC-8 BEGIN
    //GET
    //Gets all the policies name
    getAllPolicyNames: function (req, res) {
        try {
            Admin.getpoliciesname((error, results) => {
                if (error) {
                    console.error('Getting all the policy names failed:', error);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'policy names get failed', error }));
                } else {
                    if (results.length === 0) {
                        res.writeHead(404, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ message: 'No policy names found' }));
                    } else {
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        const responseData = {
                            success: true,
                            message: 'Data Received Successfully',
                            data: results,
                        };
                        res.end(JSON.stringify(responseData));
                    }
                }
            });
        } catch (error) {
            console.error('Getting all the policy names failed:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'policy names get failed', error }));
        }
    },

    //POST
    //Inserts Policy in the database
    //Body: Policy_Name, Policy_Desc
    //JSON format
    insertPolicy: function (req, res) {
        let body = '';

        req.on('data', chunk => {
            body += chunk;
        });

        req.on('end', () => {
            try {
                const requestData = JSON.parse(body);
                const Policy_Name = requestData['Policy_Name'];
                const Policy_Desc = requestData['Policy_Desc'];

                if (!Policy_Name || !Policy_Desc) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Missing Policy_Name or Policy_Desc in the request body' }));
                } else {
                    Admin.insertpolicy(Policy_Name, Policy_Desc, (error, results) => {
                        if (error) {
                            console.error('Insert failed:', error);
                            res.writeHead(500, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ message: 'Business Policy Insert failed', error }));
                        } else {
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            const responseData = {
                                success: true,
                                message: 'Data Inserted Successfully',
                                data: { Policy_Name, Policy_Desc },
                            };
                            res.end(JSON.stringify(responseData));
                        }
                    });
                }
            } catch (error) {
                console.error('Business Policy Insert failed:', error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Business Policy Insert failed', error }));
            }
        });
    },

    getAllCustomers: function (req, res) {
        Admin.getAllCustomers((error, customers) => {
            if (error) {
                console.error(error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Error retrieving customers' }));
            } else {
                if (customers.length === 0) {
                    console.error(error);
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'No customers found' }));
                } else {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    const responseData = {
                        success: true,
                        message: 'Columns retrieved successfully',
                        data: customers,
                    };
                    res.end(JSON.stringify(responseData));
                    //res.status(200).json({ success: true, message: 'Customers retrieved successfully', data: customers });
                }
            }
        });
    },

    processAdminDebitCardRequest: function (req, res) {
        let body = '';
    
        req.on('data', (chunk) => {
          body += chunk;
        });
    
        req.on('end', async () => {
          try {
            //const requestData = JSON.parse(body);
            //const customer_id = parseInt(requestData['c-id']);
            //const customer_id = req.body.adminCustomerId;
            //console.log(customer_id);

            const request_data = JSON.parse(body);
            const customer_id = request_data['adminCustomerId'];
    
            if (!customer_id) {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Missing customer id in the request' }));
              return;
            }
    
            // Call the function in the Cards module to process the debit card request
            Admin.processAdminDebitCardRequest(customer_id, (error, result) => {
              if (error) {
                console.error(error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Debit Card Request Denied' }));
              } else {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                const responseData = {
                  success: true,
                  message: 'New Debit card details created',
                  data: result,
                };
                res.end(JSON.stringify(responseData));
              }
            });
          } catch (error) {
            console.error(error);
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid JSON data in the request body' }));
          }
        });
      },

    //GET
    //Gets the description for the given policy name
    //query param: Policy_Name
    getPolicyDesc: function (req, res) {
        const parsed_url = url.parse(req.url, true);
        const policy_name = parsed_url.query.policyname;

        if (!policy_name) {
            res.writeHead(400, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({ error: 'Missing policy_name in the request body' }));
            return;
        }

        Admin.getpolicydesc(policy_name, (error, results) => {
            if (error) {
                console.log('Business Policy Get failed:', error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Business Policy Get failed', error }));
            } else {
                if (!results) {
                    console.log('No Business Policy with the name ' + policy_name + ' found');
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'No Business Policy with the name ' + policy_name + ' found' }));
                } else {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    const responseData = {
                        success: true,
                        message: 'Data Retrieved Successfully',
                        data: results, // Remove the unnecessary object around 'results'.
                    };
                    res.end(JSON.stringify(responseData));
                }
            }
        });
    },

    //PUT
    //updates the value of the selected policy description
    //Body: Policy_Name and Policy_Desc
    //JSON
    updatePolicy: function (req, res) {
        let body = '';

        req.on('data', chunk => {
            body += chunk;
        });

        req.on('end', () => {
            try {
                const requestData = JSON.parse(body);
                const Policy_Name = requestData['Policy_Name'];
                const Policy_Desc = requestData['Policy_Desc'];

                if (!Policy_Name || !Policy_Desc) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Missing or invalid Policy_Name or Policy_Desc in the request body' }));
                } else {
                    Admin.updatepolicy(Policy_Name, Policy_Desc, (error, results) => {
                        if (error) {
                            console.error('Policy Description Update failed:', error);
                            res.writeHead(500, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ message: 'Policy Description Update failed', error }));
                        }
                        else if(results.affectedRows===0)
                        {
                            console.error('No Policy with the name found:', Policy_Name);
                            res.writeHead(404, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ message: 'No Policy with the name found', Policy_Name }))
                        }
                        else {
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            const responseData = {
                                success: true,
                                message: 'Data Updated Successfully',
                                data: { Policy_Name, Policy_Desc },
                            };
                            res.end(JSON.stringify(responseData));
                        }
                    });
                }
            } catch (error) {
                console.error('Policy Description Update failed:', error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Policy Description Update failed', error }));
            }
        });
    },

    //DELETE
    //Deletes the selected policy name
    //Query: Policy_Name
    //JSON
    deletePolicy: function (req, res) {
        const parsed_url = url.parse(req.url, true);
        const Policy_Name = parsed_url.query.policyname; // Correct the query parameter name.

        if (!Policy_Name) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Missing or invalid Policy_Name in the query' }));
            return;
        }

        Admin.deletepolicy(Policy_Name, (error, results) => {
            if (error) {
                console.error('Policy Delete failed:', error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Policy Delete failed', error }));
            } else if (results.affectedRows === 0) {
                console.error('No Policy with the name found:', Policy_Name);
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'No Policy with the name found', Policy_Name }));
            } else {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                const responseData = {
                    success: true,
                    message: 'Data Deleted Successfully',
                    data: { Policy_Name },
                };
                res.end(JSON.stringify(responseData));
            }
        });
    },
    //UC-8 END

    //UC-11 BEGIN
    //GET
    //Gets all the policy rate names
    getAllPolicyRates: function (req, res) {
        try {
            Admin.getpoliciesrates((error, results) => {
                if (error) {
                    console.error('Getting all the policy rates failed:', error);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Getting all the policy rates failed', error }));
                } else {
                    if (results.length === 0) {
                        res.writeHead(404, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ message: 'No policy rates found' }));
                    } else {
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        const responseData = {
                            success: true,
                            message: 'Data Received Successfully',
                            data: results,
                        };
                        res.end(JSON.stringify(responseData));
                    }
                }
            });
        } catch (error) {
            console.error('Getting all the policy rates failed:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Getting all the policy rates failed', error }));
        }
    },

    //POST
    //GET Insert Policy rate name and value in the database
    //Body: Policy_Name and rate
    //JSON
    insertPolicyRates: function (req, res) {
        let body = '';

        req.on('data', chunk => {
            body += chunk;
        });

        req.on('end', () => {
            try {
                const requestData = JSON.parse(body);
                const Policy_Name = requestData['Policy_Name'];
                const rate = parseFloat(requestData['rate']);

                if (!Policy_Name || !rate) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Missing Policy_Name or Rate in the request body' }));
                }
                else if(rate<0){
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Rate cannot be negative' }));
                }
                else {
                    Admin.insertpolicyrate(Policy_Name, rate, (error, results) => {
                        if (error) {
                            console.error('Insert failed:', error);
                            res.writeHead(500, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ message: 'Business Policy Insert failed', error }));
                        } else {
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            const responseData = {
                                success: true,
                                message: 'Data Inserted Successfully',
                                data: { Policy_Name, rate },
                            };
                            res.end(JSON.stringify(responseData));
                        }
                    });
                }
            } catch (error) {
                console.error('Business Policy Insert failed:', error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Business Policy Insert failed', error }));
            }
        });
    },

    //PUT
    //updates the value of the selected policy rate
    //Body: Policy_Name and rate
    //JSON
    updatePolicyRate: function (req, res) {
        let body = '';

        req.on('data', chunk => {
            body += chunk;
        });

        req.on('end', () => {
            try {
                const requestData = JSON.parse(body);
                const Policy_Name = requestData['Policy_Name'];
                const rate = parseFloat(requestData['rate']);

                if (!Policy_Name || isNaN(rate)) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Missing or invalid Policy_Name or Rate in the request body' }));
                } else if (rate < 0) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Rate cannot be negative' }));
                } else {
                    Admin.updatepolicyrate(Policy_Name, rate, (error, results) => {
                        if (error) {
                            console.error('Policy Rate Update failed:', error);
                            res.writeHead(500, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ message: 'Policy Rate Update failed', error }));
                        }
                        else if(results.affectedRows===0)
                        {
                            console.error('No Policy with the name found:', Policy_Name);
                            res.writeHead(404, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ message: 'No Policy with the name found', Policy_Name }))
                        }
                            else {
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            const responseData = {
                                success: true,
                                message: 'Data Updated Successfully',
                                data: { Policy_Name, rate },
                            };
                            res.end(JSON.stringify(responseData));
                        }
                    });
                }
            } catch (error) {
                console.error('Policy Rate Update failed:', error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Policy Rate Update failed', error }));
            }
        });
    },

    //DELETE
    //Deletes the selected policy name
    //Query: Policy_Name
    //JSON
    deletePolicyRate: function (req, res) {
        const parsed_url = url.parse(req.url, true);
        const Policy_Name = parsed_url.query.policyname;

        if (!Policy_Name) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Missing or invalid Policy_Name in the query' }));
            return;
        }

        Admin.deletepolicyrate(Policy_Name, (error, results) => {
            if (error) {
                console.error('Policy Rate Delete failed:', error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Policy Rate Delete failed', error }));
            } else if (results.affectedRows === 0) {
                console.error('No Policy with the name found:', Policy_Name);
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'No Policy with the name found', Policy_Name }));
            } else {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                const responseData = {
                    success: true,
                    message: 'Data Deleted Successfully',
                    data: { Policy_Name },
                };
                res.end(JSON.stringify(responseData));
            }
        });
    },

    deleteTeller: function (req, res) {
        let body = '';
        req.on('data', (parts) => {
          body += parts;
        });
      
        req.on('end', () => {
            const parsedBody = JSON.parse(body);
            const admin_customer_id = parseInt(req.customerId);
            const employee_id = parsedBody.employee_id;

            if (!employee_id) {
                res.statusCode = 500;
                return res.end(JSON.stringify({error: 'Missing EmployeeID of Teller to Delete.'}));
            }

            Admin.getCustID(employee_id, (error, results) => {
                if (error) {
                    console.error('Fetching customer ID of Teller Failed:', error);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    //res.end(JSON.stringify({ message: 'Fetching customer ID of Teller Failed', error }));
                    return res.end(JSON.stringify({error: 'Fetching customer ID of Teller Failed.', error}));
                }
                const fetch_cust_id = JSON.parse(JSON.stringify(results));
                
                if (fetch_cust_id.length === 0) {
                    res.statusCode = 404;
                    return res.end(JSON.stringify({error: 'Login credentails of Teller not found.', error}));
                } else if (fetch_cust_id.length > 1) {
                    res.statusCode = 500;
                    return res.end(JSON.stringify({error: 'Duplicate login credentials found for Teller.', error}));
                }

                const cust_id = fetch_cust_id[0].customer_id;

                Admin.deleteTellerRep(employee_id, (error, results) => {
                    if (error) {
                        console.error('Failed in deleting Teller as Bank Representative:', error);
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        return res.end(JSON.stringify({error: 'Failed in deleting Teller as Bank Representative.', error}));
                    }

                    Admin.deleteTellerCred(cust_id, (error, results) => {
                        if (error) {
                            console.error('Failed in deleting Teller login credentials:', error);
                            res.writeHead(500, { 'Content-Type': 'application/json' });
                            return res.end(JSON.stringify({error: 'Failed in deleting Teller login credentials.', error}));
                        }
                        
                        res.writeHead(200,{'Content-Type':'application/json'});
                        return res.end(JSON.stringify({message: 'Deleted Teller Successfully'}));
                    });
                });

            })

        });
    },

    getTellers: function(req, res){
        let body = '';
        req.on('data', chunk => {
          body += chunk;
        });
        req.on('end', async () => {
            const admin_customer_id = parseInt(req.customerId);
            Admin.checkAdmin(admin_customer_id, (error, results) => {
                console.log('In addTeller: In checkAdmin');
                if (error) {
                    console.log('In addTeller: In checkUsernames: error');
                    console.error('Failed while checking if user has admin rights:', error);
                    console.log('Failed while checking if user has admin rights:');
                    res.writeHead(403, { 'Content-Type': 'application/json' });
                    //res.end(JSON.stringify({ message: 'Fetching customer ID of Teller Failed', error }));
                    return res.end(JSON.stringify({error: 'Failed while checking if user has admin rights.', error}));
                }
                const user_type = JSON.parse(JSON.stringify(results));
                console.log(`user_type[0].user_type: ${user_type[0].user_type}`);
                console.log(`admin_customer_id: ${admin_customer_id}`);
                if (user_type[0].user_type !== 'Admin') {
                    console.log('In addTeller: User has Insufficient permission to view Tellers');
                    res.statusCode = 403;
                    return res.end(JSON.stringify({error: 'User has Insufficient permission to view Tellers'}));
                }

                Admin.getTellers((error, results) => {
                    if(error){
                    console.error(error);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Failed while fetching list of all tellers' }));
                    } else{
                    console.log(`Result of get query: ${JSON.stringify(results)}`);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    const responseData = {
                        success: true,
                        message: 'Data Received Successfully',
                        //data: {results},
                        data: { teller: results }
                    };
                    res.end(JSON.stringify(responseData));
                    }
                });
            });  
        });
      },

      addTeller: function (req, res) {
        let body = '';
        req.on('data', (parts) => {
          body += parts;
        });
      
        req.on('end', async ()  => {
            console.log('In addTeller');
            const parsedBody = JSON.parse(body);
            const admin_customer_id = parseInt(req.customerId);
            const password = parsedBody.password;
            console.log(`password: ${password}`);
            const hashedPassword = await bcrypt.hash(password, 10);
            console.log(`hashedPassword: ${hashedPassword}`);
            const username = parsedBody.username;
            console.log(`username: ${username}`);
            const firstName = parsedBody.first_name;
            console.log(`firstName: ${firstName}`);
            const lastName = parsedBody.last_name;
            console.log(`lastName: ${lastName}`);

            if (!username || !password || !firstName || !lastName) {
                res.statusCode = 500;
                return res.end(JSON.stringify({error: 'Missing Teller details.'}));
            }
            console.log('In addTeller: past if condition');
            Admin.checkAdmin(admin_customer_id, (error, results) => {
                console.log('In addTeller: In checkAdmin');
                if (error) {
                    console.log('In addTeller: In checkUsernames: error');
                    console.error('Failed while checking if user has admin rights:', error);
                    console.log('Failed while checking if user has admin rights:');
                    res.writeHead(403, { 'Content-Type': 'application/json' });
                    //res.end(JSON.stringify({ message: 'Fetching customer ID of Teller Failed', error }));
                    return res.end(JSON.stringify({error: 'Failed while checking if user has admin rights.', error}));
                }
                const user_type = JSON.parse(JSON.stringify(results));
                console.log(`user_type[0].user_type: ${user_type[0].user_type}`);
                console.log(`admin_customer_id: ${admin_customer_id}`);
                if (user_type[0].user_type !== 'Admin') {
                    console.log('In addTeller: User has Insufficient permission to create new Teller');
                    res.statusCode = 403;
                    //return res.end(JSON.stringify({error: 'User has Insufficient permission to create new Teller', error}));
                    return res.end(JSON.stringify({error: 'User has Insufficient permission to create new Teller'}));
                }

                Admin.checkUsernames(username, (error, results) => {
                    console.log('In addTeller: In checkUsernames');
                    if (error) {
                        console.log('In addTeller: In checkUsernames: error');
                        console.error('Failed in checking username availability:', error);
                        console.log('Failed in checking username availability:');
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        //res.end(JSON.stringify({ message: 'Fetching customer ID of Teller Failed', error }));
                        return res.end(JSON.stringify({error: 'Failed in checking username availability.', error}));
                    }
                    const user_name_count = JSON.parse(JSON.stringify(results));
                    console.log(`In addTeller: user_name_count[0].cnt: ${user_name_count[0].cnt}`);
                
                    if (user_name_count[0].cnt > 0) {
                        console.log('In addTeller: in username not avaialble condition');
                        res.statusCode = 409;
                        return res.end(JSON.stringify({error: 'User already exists. Please choose another username', error}));
                    }

                    console.log(`In addTeller:just before addTellerCred`);
                    Admin.getMaxCustId((error, results) => {
                        console.log('In addTeller: in getMaxCustId');
                        if (error) {
                            console.error('Failed in generating new cust ID:', error);
                            res.writeHead(500, { 'Content-Type': 'application/json' });
                            return res.end(JSON.stringify({error: 'Failed in generating new cust ID.', error}));
                        }
                        const max_cust_id = JSON.parse(JSON.stringify(results));
                        const new_cust_id = max_cust_id[0].max_cust + 1;
                        console.log(`In addTeller: in getMaxCustId. max_cust_id: ${max_cust_id}`);
                        console.log(`In addTeller: in getMaxCustId. new_cust_id: ${new_cust_id}`);

                        Admin.addTellerCred(new_cust_id,'Teller',username,hashedPassword, (error, results) => {
                            console.log('In addTeller: in addTellerCred');
                            if (error) {
                                console.error('Failed in adding Teller as Bank Representative:', error);
                                res.writeHead(500, { 'Content-Type': 'application/json' });
                                return res.end(JSON.stringify({error: 'Failed in adding Teller as Bank Representative.', error}));
                            }
                            Admin.addTellerRep(new_cust_id,firstName,lastName,'Teller', (error, results) => {
                                console.log('In addTeller: in addTellerRep');
                                if (error) {
                                    console.error('Failed in adding Teller login credentials:', error);
                                    res.writeHead(500, { 'Content-Type': 'application/json' });
                                    return res.end(JSON.stringify({error: 'Failed in adding Teller login credentials.', error}));
                                }
                                console.log('In addTeller: returning successfully');
                                res.writeHead(200,{'Content-Type':'application/json'});
                                return res.end(JSON.stringify({success: true, message: 'Added Teller Successfully'}));
                            });
                        });
                    });
                })
            });
        });
    }

}

module.exports = adminController;