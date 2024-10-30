import { expect } from "chai";
import { ethers, deployments, getNamedAccounts } from "hardhat";
import { MyToken } from "../typechain-types";

describe('MyToken', function() {
    let token: MyToken;
    let deployer: string;
    let user: string;
    let tokenAsUser: MyToken;

    beforeEach(async function() {
        ({deployer, user} = await getNamedAccounts());

        await deployments.fixture(['MyToken']);
        token = await ethers.getContract<MyToken>('MyToken');
        tokenAsUser = await ethers.getContract<MyToken>('MyToken', user);
    });

    it("works", async function() {
        const tokenId = "QmSVrWiaiYzb6JKYduUewbMF1Px6N82NKDUKBee6WK3DeK"; // CID from pinata

        const mintTx = await token.safeMint(user, tokenId);
        await mintTx.wait();

        console.log(await token.tokenURI(0));

        expect(await token.tokenURI(0)).to.eq(`ipfs://${tokenId}`);

        const tokenId2 = "QmSVrWiaiYzb6JKYduUewbMF1Px6N82NKDUKBee6WK3Dej";

        const mintTx2 = await token.safeMint(user, tokenId2);
        await mintTx2.wait();

        const tokenId3 = "QmSVrWiaiYzb6JKYduUewbMF1Px6N82NKDUKBee6WK3DeS";

        const mintTx3 = await token.safeMint(deployer, tokenId3);
        await mintTx3.wait();

        expect(await token.totalSupply()).to.eq(3);
        const deployerTokenId = await token.tokenOfOwnerByIndex(deployer, 0);
        expect(deployerTokenId).to.eq(2);
        expect(await token.tokenURI(deployerTokenId)).to.eq(`ipfs://${tokenId3}`);

        expect(await token.ownerOf(deployerTokenId)).to.eq(deployer);

        const approveTx = await token.approve(user, deployerTokenId);
        await approveTx.wait();

        const transferTx = await tokenAsUser.transferFrom(deployer, user, deployerTokenId);
        await transferTx.wait();

        expect(await token.ownerOf(deployerTokenId)).to.eq(user);

        const burnTx = await tokenAsUser.burn(deployerTokenId);
        await burnTx.wait()

        expect(await token.totalSupply()).to.eq(2);
    });
});