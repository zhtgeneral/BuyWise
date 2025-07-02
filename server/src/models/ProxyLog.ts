import mongoose, { Schema, Document } from 'mongoose';

export interface IProxyLog extends Document {
  originalUrl: string;
  proxyUrl: string;
  params: Record<string, any>;
  userId?: mongoose.Types.ObjectId;
  userAgent?: string;
  ipAddress?: string;
  redirectUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProxyLogSchema: Schema = new Schema({
  originalUrl: {
    type: String,
    required: [true, 'Original URL is required']
  },
  proxyUrl: {
    type: String,
    required: [true, 'Proxy URL is required']
  },
  params: {
    type: Schema.Types.Mixed,
    required: [true, 'Parameters are required']
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  userAgent: {
    type: String,
    required: false
  },
  ipAddress: {
    type: String,
    required: false
  },
  redirectUrl: {
    type: String,
    required: [true, 'Redirect URL is required']
  }
}, {
  timestamps: true
});

export default mongoose.model<IProxyLog>('ProxyLog', ProxyLogSchema); 