const mongoose = require('mongoose');
const Picture = require('./picture');
const Tag = require('./tag');

const schema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        alias: { type: String },
        description: { type: String },
        slug: { type: String, required: true, unique: true },
        private: { type: Boolean, default: false },
        community: { type: Boolean, default: false },
        nsfw: { type: Boolean, default: false },
        tags: [{ type: mongoose.mongo.ObjectId, ref: 'Tag' }],
        channelId: { type: String, required: true },
        createdBy: { type: mongoose.mongo.ObjectId, ref: 'User' },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
    },
    {
        versionKey: false,
    }
);

schema.virtual('pictures', {
    ref: Picture,
    localField: '_id',
    foreignField: 'album',
});
schema.virtual('picturesCount', {
    ref: Picture,
    localField: '_id',
    foreignField: 'album',
    count: true,
});

schema.query.paginate = function (page, count) {
    return this.skip(count * (page - 1)).limit(count);
};

schema.method('toJSON', function () {
    return {
        id: this._id,
        name: this.name,
        alias: this.alias,
        description: this.description,
        slug: this.slug,
        private: this.private,
        community: this.community,
        picturesCount: this.picturesCount,
        tags: this.tags,
        createdBy: this.createdBy,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
    };
});
schema.method('syncTags', async function () {
    await Tag.updateMany({ _id: { $nin: this.tags } }, { $pull: { albums: this.id } });
    await Tag.updateMany({ _id: { $in: this.tags } }, { $addToSet: { albums: this.id } });
});

schema.pre('find', function (next) {
    const { full } = this.getOptions();

    if (full) {
        this.populate('picturesCount');
        this.populate('createdBy', 'name');
        this.populate('tags', ['name', 'slug']);
    } else {
        this.select(['name', 'slug']);
    }

    this.sort({ createdAt: 'desc' });

    next();
});
schema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Album', schema);
