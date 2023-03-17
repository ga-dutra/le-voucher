import voucherService from "services/voucherService.js";
import voucherRepository from "repositories/voucherRepository.js";
import { jest } from "@jest/globals";

jest.mock("uuid", () => ({ v4: () => "Voucher created by mock" }));

describe("voucherService test suite", () => {
  const code = "RANDOM_STRING";
  it("should create a discount", () => {
    const order = voucherService.createVoucher("abc", 50);
    expect(order).toEqual({
      discount: 50,
      serial: expect.any(String),
    });
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
