const Web3 = require('web3');
const assert = require('assert');
const ganache = require('ganache-cli');
const { bytecode, interface } = require('../compile');

const provider = ganache.provider();
const web3 = new Web3(provider);

const GAS = '1000000';
const INITIAL_MESSAGE = 'Hi there!';

describe('Inbox Contract', () => {
  let accounts;
  let inbox;

  beforeEach(async () => {
    // Get a list of all accounts.
    accounts = await web3.eth.getAccounts();

    // Use one of those accounts to deploy the contract.
    inbox = await new web3.eth.Contract(JSON.parse(interface))  // Teaches web3 about what methods an Inbox contract has.
      .deploy({ data: bytecode, arguments: [INITIAL_MESSAGE] }) // Tells web3 that we want to deploy a new copy of this contract.
      .send({ from: accounts[0], gas: GAS });                   // Instructs web3 to send out a transaction that creates this contract.

    inbox.setProvider(provider);
  });

  it('deploys a contract', () => {
    assert.ok(inbox.options.address);
  });

  it('has an initial message', async () => {
    const message = await inbox.methods.message().call();
    assert.equal(message, INITIAL_MESSAGE);
  });

  it('can update the message', async () => {
    await inbox.methods.setMessage('bye').send({ from: accounts[0], gas: GAS });
    const message = await inbox.methods.message().call();
    assert.equal(message, 'bye');
  });
});
