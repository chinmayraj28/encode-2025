import assert from "assert";
import { 
  TestHelpers,
  MediaAssetNFT_Approval
} from "generated";
const { MockDb, MediaAssetNFT } = TestHelpers;

describe("MediaAssetNFT contract Approval event tests", () => {
  // Create mock db
  const mockDb = MockDb.createMockDb();

  // Creating mock for MediaAssetNFT contract Approval event
  const event = MediaAssetNFT.Approval.createMockEvent({/* It mocks event fields with default values. You can overwrite them if you need */});

  it("MediaAssetNFT_Approval is created correctly", async () => {
    // Processing the event
    const mockDbUpdated = await MediaAssetNFT.Approval.processEvent({
      event,
      mockDb,
    });

    // Getting the actual entity from the mock database
    let actualMediaAssetNFTApproval = mockDbUpdated.entities.MediaAssetNFT_Approval.get(
      `${event.chainId}_${event.block.number}_${event.logIndex}`
    );

    // Creating the expected entity
    const expectedMediaAssetNFTApproval: MediaAssetNFT_Approval = {
      id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
      owner: event.params.owner,
      approved: event.params.approved,
      tokenId: event.params.tokenId,
    };
    // Asserting that the entity in the mock database is the same as the expected entity
    assert.deepEqual(actualMediaAssetNFTApproval, expectedMediaAssetNFTApproval, "Actual MediaAssetNFTApproval should be the same as the expectedMediaAssetNFTApproval");
  });
});
