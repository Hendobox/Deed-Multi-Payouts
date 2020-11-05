// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.6.0;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract DeedMultiPayouts is ReentrancyGuard {
    using SafeMath for uint256;
    
    address public lawyer;  //lawyer's address. Should be the deployer
    address payable public beneficiary;     //beneficiary's address
    uint public earliest;       //earliest time before payments can be made
    uint public amount;     //amount to be withdrawn
    uint constant public PAYOUTS = 10;      //maximum number of times to make withdrawal
    uint constant public INTERVAL = 10;     //time interva before next withdrawal
    uint public paidPayouts;        //number of eligible withdrawals made
    
    //constructor function passes the various addresses and earliest withdrawal time on deployment
    constructor(address _lawyer, address payable _beneficiary, uint fromNow) payable public {
        lawyer = _lawyer;
        beneficiary = _beneficiary;
        earliest = now.add(fromNow) ;
        amount = msg.value.div(PAYOUTS) ;
    }
    
    //function for withdrawal of funds
    function withdraw() public nonReentrant{
        //beneficiary must be the caller
        require(msg.sender == beneficiary, 'only beneficiary can call this');
        //cannot make call before thestipulated time
        require(now >= earliest, 'too early to make call');
        //must not withdraw more than required times
        require(paidPayouts < PAYOUTS, 'no payouts left');
        //eligible payouts in time intervals
        uint eligiblePayouts = now.sub(earliest).div(INTERVAL);
        //calculates the due number of payouts at a given time
        uint duePayouts = eligiblePayouts.sub(paidPayouts) ;
        duePayouts = duePayouts.add(paidPayouts)  > PAYOUTS ? PAYOUTS.sub(paidPayouts) : duePayouts;
        paidPayouts = paidPayouts.add(duePayouts);
        //transfers funds from smart contract to beneficiary
        (bool success,) = beneficiary.call.value(duePayouts * amount)("");
        require(success, "Transfer failed");
       // beneficiary.transfer(duePayouts * amount);
    }
}

