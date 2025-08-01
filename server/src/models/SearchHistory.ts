import mongoose, { Schema, Document } from 'mongoose';

export interface ISearchHistory extends Document {
  userId: string;
  searchTerms: string[];
  createdAt: string;
  updatedAt: string;
}

const SearchHistorySchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    unique: true
  },
  searchTerms: {
    type: [String],
    default: [],
    validate: {
      validator: function(arr: string[]) {
        return arr.length <= 50;
      },
      message: 'Search history cannot exceed 50 entries'
    }
  }
}, {
  timestamps: true
});

export default mongoose.model<ISearchHistory>('SearchHistory', SearchHistorySchema);
