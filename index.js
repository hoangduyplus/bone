(async () => {
    require('dotenv').config({ path: `${__dirname}/.env` });
    const fetch = require("node-fetch");
    const fs = require("fs");
    const path = require('path');
    const { Web3 } = require('web3');
    var web3 = new Web3('https://puppynet.shibrpc.com');
    const getFaucet = (async (address) => {
        var opts = {
            method: 'get',
            headers: {
                'accept': '*/*',
                'accept-encoding': 'gzip, deflate, br',
                'accept-language': 'en-US,en;q=0.9',
                'cache-control': 'no-cache',
                "content-type": "application/x-www-form-urlencoded",
                'pragma': 'no-cache',
                'referer': 'https://www.facebook.com/',
                'sec-ch-prefers-color-scheme': 'light',
                'sec-ch-ua': String.raw`"Google Chrome";v="107", "Chromium";v="107", "Not=A?Brand";v="24"`,
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': String.raw`"macOS"`,
                'sec-fetch-dest': 'document',
                'sec-fetch-mode': 'navigate',
                'sec-fetch-site': 'same-origin',
                'sec-fetch-user': '?1',
                'upgrade-insecure-requests': '1',
                'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
                'viewport-width': '1512'
            }
        };
        return await fetch(`https://faucet.shib.io/api/faucet/${address}?type=2`, opts);
    });

    const mainWallet = process.env.mainWallet;
    while (true) {
        var l = [];
        while (l.length < 5) {
            var wallet = web3.eth.accounts.create();
            l.push(wallet)
        }
        await Promise.all(l.map(async (wallet, i) => {
            try {
                var response = await getFaucet(wallet.address);
                if (response.status == 200) {
                    var body = await response.json();
                    if (body.status == 'success') {
                        await web3.eth.accounts.signTransaction({
                            from: wallet.address,
                            to: mainWallet,
                            value: '99000000000000000',
                            gasPrice: "20000000000",
                            gas: "21000",
                        }, wallet.privateKey).then(async function (signed) {
                            await web3.eth.sendSignedTransaction(signed.rawTransaction).on('receipt', function (result) { console.log(new Date().toTimeString()) })
                        })
                    }
                } else {
                    var body = await response.text();
                    fs.appendFile("errorLog.txt", body+"\n", function (err) {})
                }
            } catch { }

        }));
    }

})();
