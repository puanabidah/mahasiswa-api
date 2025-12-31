import express from "express";
import * as ctrl from "../controllers/mahasiswaController.js";
import validate from "../middlewares/validate.js";
import * as schema from "../schemas/mahasiswaSchema.js";

const router = express.Router();

router.get("/", ctrl.getAllMahasiswa);

router.get(
  "/:nim",
  validate(schema.nimParamSchema, "params"),
  ctrl.getMahasiswaByNim
);

router.post("/", validate(schema.mahasiswaSchema), ctrl.createMahasiswa);

router.post(
  "/bulk",
  validate(schema.bulkMahasiswaSchema),
  ctrl.createBulkMahasiswa
);

router.put(
  "/:nim",
  validate(schema.nimParamSchema, "params"),
  validate(schema.putMahasiswaSchema),
  ctrl.updateAllField
);

router.patch(
  "/:nim",
  validate(schema.nimParamSchema, "params"),
  validate(schema.patchMahasiswaSchema),
  ctrl.updatePartialField
);

router.delete(
  "/:nim",
  validate(schema.nimParamSchema, "params"),
  ctrl.deleteMahasiswa
);

export default router;
