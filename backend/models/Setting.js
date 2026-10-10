import mongoose from 'mongoose';

// A single document holding site-wide, admin-editable settings.
// Right now it stores image overrides for the homepage hero slider
// and the "Shop by Style" category tiles. Each array is indexed to
// match the slide/tile order on the frontend; an empty slot means
// "use the built-in default image".
const settingSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'site', unique: true },
    heroImages: { type: [String], default: [] },
    categoryImages: { type: [String], default: [] },
  },
  { timestamps: true }
);

// Always return the one-and-only settings document, creating it on first use.
settingSchema.statics.getSingleton = async function () {
  let doc = await this.findOne({ key: 'site' });
  if (!doc) {
    doc = await this.create({ key: 'site' });
  }
  return doc;
};

const Setting = mongoose.model('Setting', settingSchema);
export default Setting;
