App = {
  web3Provider: null,
  contracts: {},

  init: async function() {
    // Load nfts.
    $.getJSON('../nfts.json', function(data) {
      var nftsRow = $('#nftRow');
      var nftTemplate = $('#nftTemplate');

      for (i = 0; i < data.length; i ++) {
        nftTemplate.find('.panel-title').text(data[i].title);
        nftTemplate.find('img').attr('src', data[i].picture);
        nftTemplate.find('.nft-author').text(data[i].author);
        nftTemplate.find('.nft-date').text(data[i].date);
        nftTemplate.find('.nft-price').text(data[i].price);
        
        nftTemplate.find('.btn-buy').attr('data-id', data[i].id);
        nftTemplate.find('.btn-mint').attr('data-id', data[i].id);

        nftsRow.append(nftTemplate.html());
      }
    });

    return await App.initWeb3();
  },

  initWeb3: async function() {
    // Modern dapp browsers...
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      try{
        // Request account access
        await window.ethereum.enable();
      } catch(error){
        // User denied account access...
        console.error("User denied account access")
      }
    }

    // Legacy dapp browsers...
    else if(window.web3) {
      App.web3Provider = window.web3.currentProvider;
    }

    // If no injected web3 instance is detected, fall back to Ganache
    else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }

    web3 = new Web3(App.web3Provider);

    return App.initContract();
  },

  initContract: function() {
    $.getJSON('MyNFT.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with @truffle/contract
      var MyNFTArtifact = data;
      App.contracts.MyNFT = TruffleContract(MyNFTArtifact);

      // Set the provider for our contract
      App.contracts.MyNFT.setProvider(App.web3Provider);

      // Use our contract to retrieve and mark the adopted pets
      App.markMinted();
      App.markSold();

      return 0;
      
    });

    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '.btn-buy', App.handleBuy);
    $(document).on('click', '.btn-mint', App.handleMint);
  },

  markSold: function() {
    var nftInstance;
    
    App.contracts.MyNFT.deployed().then(function(instance) {
      nftInstance = instance;

      // Get owners list from smart contract
      return nftInstance.getOwners.call();
    }).then(function(owners) {
      for (i=0; i < owners.length; i++){
        // Search for the ones assigned to mark them sold
        if (owners[i] !== '0x0000000000000000000000000000000000000000') {
          $('.panel-nft').eq(i).find('.btn-buy').text('Sold').attr('disabled', true);
        }
      }
    }).catch(function(error) {
      console.log(error.message);
    });
  },

  markMinted: function() {
    var nftInstance;
    
    App.contracts.MyNFT.deployed().then(function(instance) {
      nftInstance = instance;

      // Get the minted NFTs list 
      return nftInstance.getMinted.call();
    }).then(function(minted) {
      for (i=0; i < minted.length; i++){
        // Search for the ones assigned to mark them Minted
        if (minted[i] !== '0x0000000000000000000000000000000000000000') {
          $('.panel-nft').eq(i).find('.btn-mint').text('Minted').attr('disabled', true);
        }
      }
    }).catch(function(error) {
      console.log(error.message);
    });
  },

  handleMint: function(event) {
    event.preventDefault();

    var nftId = parseInt($(event.target).data('id'));
    var nftInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if(error) {
        console.log(error);
      }

      var account = accounts[0];
      App.contracts.MyNFT.deployed().then(function(instance) {
        nftInstance = instance;
        // Mint NFT and charge a commission of 0.1 ETH
        return nftInstance.mintNFT(nftId, {from: account, value: web3.toWei(0.1, 'ether')});
      }).then(function(result) {
        return App.markMinted();
      }).catch(function(error) {
        console.log(error.message);
      });
    });

  },

  handleBuy: function(event) {
    event.preventDefault();
    var nftId = parseInt($(event.target).data('id'));
    var nftInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if(error){
        console.log(error);
      }

      var account = accounts[0];
      App.contracts.MyNFT.deployed().then(function(instance) {
        nftInstance = instance;
        // Transfer the NFT to the buyer and charge 1 ETH
        return nftInstance.transferNFT(nftId, {from: account, value: web3.toWei(1, 'ether')});
      }).then(function(result) {
        return App.markSold();
      }).catch(function(error) {
        console.log(error.message);
      });
    });    
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
