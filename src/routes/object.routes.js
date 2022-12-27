const router = require("express").Router();
const { sessionChk } = require("../config/validation.rules");
const { getObject, getObjects, addObject, updObject, delObject } = require("../controllers/objects.controller");


router.get("/:object_id", sessionChk, async function (req, res) {
  await getObject(req, res);
});
router.get("", sessionChk, async function (req, res) {
  await getObjects(req, res);
});
router.post("", sessionChk, async function (req, res) {
  await addObject(req, res);
});
router.put("/:object_id", sessionChk, async function (req, res) {
    await updObject(req, res);
  });
router.delete("/:object_id", sessionChk, async function (req, res) {
  await delObject(req, res);
});

module.exports = router;
