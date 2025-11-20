import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm } from "hardhat";
import { ShadowLedger, ShadowLedger__factory } from "../types";
// ShadowLedger contract test suite
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

type Signers = {
  deployer: HardhatEthersSigner;
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
};

async function deployFixture() {
  const factory = (await ethers.getContractFactory("ShadowLedger")) as ShadowLedger__factory;
  const shadowLedgerContract = (await factory.deploy()) as ShadowLedger;
  const shadowLedgerContractAddress = await shadowLedgerContract.getAddress();

  return { shadowLedgerContract, shadowLedgerContractAddress };
}

describe("ShadowLedger", function () {
  let signers: Signers;
  let shadowLedgerContract: ShadowLedger;
  let shadowLedgerContractAddress: string;

  before(async function () {
    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { deployer: ethSigners[0], alice: ethSigners[1], bob: ethSigners[2] };
  });

  beforeEach(async function () {
    // Check whether the tests are running against an FHEVM mock environment
    if (!fhevm.isMock) {
      console.warn(`This hardhat test suite cannot run on Sepolia Testnet`);
      this.skip();
    }

    ({ shadowLedgerContract, shadowLedgerContractAddress } = await deployFixture());
  });

  it("should return zero bill count for new user", async function () {
    const billCount = await shadowLedgerContract.getBillCount(signers.alice.address);
    expect(billCount).to.eq(0);
  });

  it("should create a bill with encrypted amount", async function () {
    const clearAmount = 100;
    const category = "Food";
    const description = "Lunch";
    
    // Encrypt amount as euint64
    const encryptedAmount = await fhevm
      .createEncryptedInput(shadowLedgerContractAddress, signers.alice.address)
      .add64(clearAmount)
      .encrypt();

    const tx = await shadowLedgerContract
      .connect(signers.alice)
      .createBill(encryptedAmount.handles[0], encryptedAmount.inputProof, category, description);
    await tx.wait();

    const billCount = await shadowLedgerContract.getBillCount(signers.alice.address);
    expect(billCount).to.eq(1);

    const billMeta = await shadowLedgerContract.getBillMeta(signers.alice.address, 0);
    expect(billMeta.category).to.eq(category);
    expect(billMeta.description).to.eq(description);

    const encryptedBillAmount = await shadowLedgerContract.getBill(signers.alice.address, 0);
    const clearBillAmount = await fhevm.userDecryptEuint(
      FhevmType.euint64,
      encryptedBillAmount,
      shadowLedgerContractAddress,
      signers.alice,
    );
    expect(clearBillAmount).to.eq(clearAmount);
  });

  it("should update total amount aggregation", async function () {
    const clearAmount1 = 50;
    const clearAmount2 = 75;
    
    // Create first bill
    const encryptedAmount1 = await fhevm
      .createEncryptedInput(shadowLedgerContractAddress, signers.alice.address)
      .add64(clearAmount1)
      .encrypt();

    let tx = await shadowLedgerContract
      .connect(signers.alice)
      .createBill(encryptedAmount1.handles[0], encryptedAmount1.inputProof, "Food", "Breakfast");
    await tx.wait();

    // Create second bill
    const encryptedAmount2 = await fhevm
      .createEncryptedInput(shadowLedgerContractAddress, signers.alice.address)
      .add64(clearAmount2)
      .encrypt();

    tx = await shadowLedgerContract
      .connect(signers.alice)
      .createBill(encryptedAmount2.handles[0], encryptedAmount2.inputProof, "Food", "Lunch");
    await tx.wait();

    // Check total amount
    const encryptedTotal = await shadowLedgerContract.getTotalAmount(signers.alice.address);
    const clearTotal = await fhevm.userDecryptEuint(
      FhevmType.euint64,
      encryptedTotal,
      shadowLedgerContractAddress,
      signers.alice,
    );
    expect(clearTotal).to.eq(clearAmount1 + clearAmount2);
  });

  it("should update category aggregation", async function () {
    const clearAmount1 = 100;
    const clearAmount2 = 50;
    
    // Create bills with same category
    const encryptedAmount1 = await fhevm
      .createEncryptedInput(shadowLedgerContractAddress, signers.alice.address)
      .add64(clearAmount1)
      .encrypt();

    let tx = await shadowLedgerContract
      .connect(signers.alice)
      .createBill(encryptedAmount1.handles[0], encryptedAmount1.inputProof, "Food", "Dinner");
    await tx.wait();

    const encryptedAmount2 = await fhevm
      .createEncryptedInput(shadowLedgerContractAddress, signers.alice.address)
      .add64(clearAmount2)
      .encrypt();

    tx = await shadowLedgerContract
      .connect(signers.alice)
      .createBill(encryptedAmount2.handles[0], encryptedAmount2.inputProof, "Food", "Snack");
    await tx.wait();

    // Check category total
    const encryptedCategoryTotal = await shadowLedgerContract.getTotalAmountByCategory(
      signers.alice.address,
      "Food"
    );
    const clearCategoryTotal = await fhevm.userDecryptEuint(
      FhevmType.euint64,
      encryptedCategoryTotal,
      shadowLedgerContractAddress,
      signers.alice,
    );
    expect(clearCategoryTotal).to.eq(clearAmount1 + clearAmount2);
  });

  it("should update monthly aggregation", async function () {
    const clearAmount = 200;
    
    const encryptedAmount = await fhevm
      .createEncryptedInput(shadowLedgerContractAddress, signers.alice.address)
      .add64(clearAmount)
      .encrypt();

    const tx = await shadowLedgerContract
      .connect(signers.alice)
      .createBill(encryptedAmount.handles[0], encryptedAmount.inputProof, "Shopping", "Groceries");
    await tx.wait();

    // Get current timestamp and calculate month index
    const latestBlock = await ethers.provider.getBlock("latest");
    const monthIndex = await shadowLedgerContract.getMonthIndex(latestBlock!.timestamp);

    // Check monthly total
    const encryptedMonthlyTotal = await shadowLedgerContract.getTotalAmountByMonth(
      signers.alice.address,
      monthIndex
    );
    const clearMonthlyTotal = await fhevm.userDecryptEuint(
      FhevmType.euint64,
      encryptedMonthlyTotal,
      shadowLedgerContractAddress,
      signers.alice,
    );
    expect(clearMonthlyTotal).to.eq(clearAmount);
  });

  it("should revert when accessing non-existent bill", async function () {
    await expect(
      shadowLedgerContract.getBill(signers.alice.address, 0)
    ).to.be.revertedWith("Bill does not exist");

    await expect(
      shadowLedgerContract.getBillMeta(signers.alice.address, 0)
    ).to.be.revertedWith("Bill does not exist");
  });

  it("should isolate bills between different users", async function () {
    const clearAmountAlice = 100;
    const clearAmountBob = 200;
    
    // Alice creates a bill
    const encryptedAmountAlice = await fhevm
      .createEncryptedInput(shadowLedgerContractAddress, signers.alice.address)
      .add64(clearAmountAlice)
      .encrypt();

    let tx = await shadowLedgerContract
      .connect(signers.alice)
      .createBill(encryptedAmountAlice.handles[0], encryptedAmountAlice.inputProof, "Food", "Lunch");
    await tx.wait();

    // Bob creates a bill
    const encryptedAmountBob = await fhevm
      .createEncryptedInput(shadowLedgerContractAddress, signers.bob.address)
      .add64(clearAmountBob)
      .encrypt();

    tx = await shadowLedgerContract
      .connect(signers.bob)
      .createBill(encryptedAmountBob.handles[0], encryptedAmountBob.inputProof, "Shopping", "Groceries");
    await tx.wait();

    // Check Alice's total
    const encryptedTotalAlice = await shadowLedgerContract.getTotalAmount(signers.alice.address);
    const clearTotalAlice = await fhevm.userDecryptEuint(
      FhevmType.euint64,
      encryptedTotalAlice,
      shadowLedgerContractAddress,
      signers.alice,
    );
    expect(clearTotalAlice).to.eq(clearAmountAlice);

    // Check Bob's total
    const encryptedTotalBob = await shadowLedgerContract.getTotalAmount(signers.bob.address);
    const clearTotalBob = await fhevm.userDecryptEuint(
      FhevmType.euint64,
      encryptedTotalBob,
      shadowLedgerContractAddress,
      signers.bob,
    );
    expect(clearTotalBob).to.eq(clearAmountBob);

    // Alice can query Bob's bill (contract allows it), but cannot decrypt without authorization
    // The bill exists and can be retrieved, but decryption requires proper authorization
    const encryptedBillBob = await shadowLedgerContract.getBill(signers.bob.address, 0);
    expect(encryptedBillBob).to.not.eq(ethers.ZeroHash); // Bill exists
  });
});

