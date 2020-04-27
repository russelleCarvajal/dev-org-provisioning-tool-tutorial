let inputTemplate =  require ('./input-template.json') 

const platformClient = require('purecloud-platform-client-v2');

const client = platformClient.ApiClient.instance;

let authorizationApi = new platformClient.AuthorizationApi();
let telephonyProvidersEdgeApi = new platformClient.TelephonyProvidersEdgeApi();
let locationsApi = new platformClient.LocationsApi();

client.loginClientCredentialsGrant("5a0fde83-e354-4145-bfea-55a703f6b109", "JRdiwR7MR7tmp678iE-OfFkPhJGJ_yzhp1-gwvYCXwg")
  .then(() => {
        let productsArray = [];

        // List all the products available in the org
        authorizationApi.getAuthorizationProducts()
            .then((data) => {
                console.log(`getAuthorizationProducts success! data: ${JSON.stringify(data, null, 2)}`);
                // Store all the products available to an array
                productsArray = data.entities;
                // Call function to check if BYOC or (Bring you own Carrier) exist in the user's org.
                checkBYOC(productsArray);        
            })
            .catch((err) => {
                console.log('There was a failure calling getAuthorizationProducts');
                console.error(err);
            });
  })

  .catch((err) => {
    // Handle failure response
    console.log(err);
  });

  // Check if there is BYOC in user's org
  function checkBYOC(productsArray) {
    productsArray.forEach(product => {
        if (product.id == 'byoc') {
            byocId = product.id;
        }
    });

    if (byocId != '') {
        console.log("Your org has BYOC Capability");
        createTrunk();
    } else {
         console.log("Your org has no BYOC Capability");
    }
  }
  // Create trunk using the credentials from config file.
  function createTrunk() {
    let trunkBody = {
      name: inputTemplate.SipTrunk.ExternalTrunkName, // External Trunk Name
      state: 'active',
      trunkMetabase: {
        id: 'external_sip_pcv_byoc_carrier.json',
        name: 'Generic BYOC Carrier'
      },
      properties: {
        trunk_type: {
          type: 'string',
          value: {
            default: 'external.pcv.byoc.carrier',
            instance: 'external.pcv.byoc.carrier'
          }
        },
        trunk_label: {
          type: 'string',
          value: {
            default: 'Generic BYOC Carrier',
            instance: 'Sample Trunk'
          }
        },
        trunk_enabled: {
          type: 'boolean',
          value: {
            default: true,
            instance: true
          }
        },
  
        trunk_transport_serverProxyList: {
          type: 'array',
          items: {
            type: 'string'
          },
          uniqueItems: true,
          value: {
            default: null,
            instance: [inputTemplate.SipTrunk.SipServers] //SIP Servers or Proxies
          },
          required: true
        },
        trunk_access_acl_allowList: {
          type: 'array',
          items: {
            type: 'string'
          },
          value: {
            default: [],
            instance: ['54.172.60.0/23', '34.203.250.0/23', '54.244.51.0/24', '54.65.63.192/26', '3.112.80.0/24', '54.169.127.128/26', '3.1.77.0/24']
          }
        },
        trunk_protocol: {
          type: 'string',
          enum: ['SIP'],
          value: {
            default: 'SIP',
            instance: 'SIP'
          }
        },
  
        trunk_sip_authentication_credentials_realm: {
          type: 'string',
          value: {
            default: '',
            instance: inputTemplate.SipTrunk.Realm // Realm
          }
        },
        trunk_sip_authentication_credentials_username: {
          type: 'string',
          value: {
            default: '',
            instance: inputTemplate.SipTrunk.UserName // User Name
          }
        },
        trunk_sip_authentication_credentials_password: {
          type: 'string',
          value: {
            default: '',
            instance: inputTemplate.SipTrunk.Password // Password
          }
        },
        trunk_outboundIdentity_callingName: {
          type: 'string',
          pattern: '^[\\S ]{0,40}$',
          value: {
            default: '',
            instance: inputTemplate.SipTrunk.CallingName // Calling Name
          }
        },
        trunk_outboundIdentity_callingName_overrideMethod: {
          type: 'string',
          enum: ['Always', 'Unassigned DID'],
          value: {
            default: 'Always',
            instance: 'Always'
          }
        },
        trunk_outboundIdentity_callingAddress: {
          type: 'string',
          value: {
            default: '',
            instance: inputTemplate.SipTrunk.Address // Calling Address
          }
        },
        trunk_outboundIdentity_callingAddress_overrideMethod: {
          type: 'string',
          enum: ['Always', 'Unassigned DID'],
          value: {
            default: 'Always',
            instance: 'Always'
          }
        },
        trunk_outboundIdentity_calledAddress_omitPlusPrefix: {
          type: 'boolean',
          value: {
            default: false,
            instance: false
          }
        },
        trunk_outboundIdentity_callingAddress_omitPlusPrefix: {
          type: 'boolean',
          value: {
            default: false,
            instance: false
          }
        },
        trunk_sip_termination_uri: {
          type: 'string',
          value: {
            instance: inputTemplate.SipTrunk.SipServers // Inbound SIP Termination Identifier
          },
          required: false
        }
  
      },
      trunkType: 'EXTERNAL'
    }; // Object | Trunk base settings  

    telephonyProvidersEdgeApi.postTelephonyProvidersEdgesTrunkbasesettings(trunkBody)
        .then((trunkData) => {
            console.log(`postTelephonyProvidersEdgesTrunkbasesettings success! data`);     
        })
        .catch((err) => {
            console.log('There was a failure calling postTelephonyProvidersEdgesTrunkbasesettings');
            console.error(err.message);
        });  
}

