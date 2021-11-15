const serverUrl = "https://vgyy4b11hszk.bigmoralis.com:2053/server";
const appId = "UkAR38SqWww25gkgwKdW2AC1nFG08kUWwzOQwE5C";
Moralis.start({ serverUrl, appId });

let user;

async function login() {
user = Moralis.User.current();

  if (!user) {
   try {
      user = await Moralis.authenticate({ signingMessage: "Gettin it ready for ya!" })
      initApp()
    } catch(error) {
      console.log(error)
    }
  }
  else{
    Moralis.enableWeb3();
    initApp()
  }
}


function initApp(){
  document.querySelector("#app").style.display = "block";
  document.querySelector("#submit_button").onclick = submit;
}

  // this is were the lazy mint comes into play and Moralis kicks in with the conversions
async function submit(){
  // get image data 
  const input = document.querySelector("#input_image");
  let data = input.files[0]

  // upload image to ipfs
  const imageFile = new Moralis.File(data.name, data)
  await imageFile.saveIPFS();
  let imageHash = imageFile.hash();
  // create metadata with img hash & data
  let metadata = {
    name: document.querySelector("#input_name").value,
    description: document.querySelector("#input_description").value,
    image: "/ipfs/" + imageHash
  }
  // upload meta data to ipfs
  const jsonFile = new Moralis.File("metadata.json", {base64 : btoa(JSON.stringify(metadata))});
  await jsonFile.saveIPFS();
  let metadataHash = jsonFile.hash();

  // upload to rarible
  let res = await Moralis.Plugins.rarible.lazyMint({
    chain: 'rinkeby',
    userAddress: user.get('ethAddress'),
    tokenType: 'ERC721',
    tokenUri: 'ipfs://' + metadataHash,
    royaltiesAmount: 5, // 0.05% royalty. Optional
})
  console.log(res);
  let token_address = res.data.result.tokenAddress;
  let token_id = res.data.result.tokenId;
  let url = `https://rinkeby.rarible.com/token/${token_address}:${token_id}`
  document.querySelector("#success_message").innerHTML =
    `NFT Minted. <a target="_blank" href="${url}">View NFT</a>`
    document.querySelector("#success_message").style.display = "block";
    setTimeout(() => {
      document.querySelector("#success_message").style.display = "none";
    }, 10000)
}


login();

// document.getElementById("btn-login").onclick = login;
// document.getElementById("btn-logout").onclick = logOut;