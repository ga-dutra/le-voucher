import voucherService from "services/voucherService.js";
import voucherRepository from "repositories/voucherRepository.js";
import { jest } from "@jest/globals";

jest.mock("uuid", () => ({ v4: () => "Voucher created by mock" }));

describe("voucherService test suite", () => {
  const code = "RANDOM_STRING";

  it("should create a voucher", async () => {
    const voucher = {
      code,
      discount: 10,
    };
    jest
      .spyOn(voucherRepository, "getVoucherByCode")
      .mockImplementationOnce((): any => {
        return {
          id: 1,
          code: voucher.code,
          discount: voucher.discount,
          used: false,
        };
      });
    jest
      .spyOn(voucherRepository, "useVoucher")
      .mockImplementationOnce((): any => {});

    const amount = 500;
    const finalExpectedAmount = amount - amount * (voucher.discount / 100);

    const order = await voucherService.applyVoucher(voucher.code, amount);

    expect(order.amount).toBe(amount);
    expect(order.discount).toBe(voucher.discount);
    expect(order.finalAmount).toBe(finalExpectedAmount);
    expect(order.applied).toBe(true);
  });

  it("should create a valid voucher", async () => {
    jest
      .spyOn(voucherRepository, "getVoucherByCode")
      .mockImplementationOnce((): any => {});

    jest
      .spyOn(voucherRepository, "createVoucher")
      .mockImplementationOnce((): any => {});

    await voucherService.createVoucher(code, 10);

    expect(voucherRepository.createVoucher).toBeCalled();
  });

  it("should result in conflict error if voucher already exists", () => {
    const voucher = {
      code,
      discount: 10,
    };
    jest
      .spyOn(voucherRepository, "getVoucherByCode")
      .mockImplementationOnce((): any => {
        return {
          code: voucher.code,
          discount: voucher.discount,
        };
      });
    const promise = voucherService.createVoucher(
      voucher.code,
      voucher.discount
    );

    expect(promise).rejects.toEqual({
      message: "Voucher already exist.",
      type: "conflict",
    });
  });
});

function createRandomValue(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
