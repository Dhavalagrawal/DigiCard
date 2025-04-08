import mongoose from "mongoose"

const DocumentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  documentName: {
    type: String,
    required: [true, "Please provide a document name"],
    trim: true,
  },
  documentType: {
    type: String,
    required: [true, "Please provide a document type"],
    enum: ["Aadhar", "PAN", "Driving License", "Voter ID", "Passport", "Other"],
  },
  filePath: {
    type: String,
    required: [true, "File path is required"],
  },
  fileType: {
    type: String,
    enum: ["image/jpeg", "image/png", "application/pdf"],
    required: true,
  },
  fileSize: {
    type: Number,
    required: true,
  },
  uploadDate: {
    type: Date,
    default: Date.now,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verifiedAt: {
    type: Date,
    default: null,
  },
  isEncrypted: {
    type: Boolean,
    default: true,
  },
  expiryDate: {
    type: Date,
    default: null,
  },
})

// Create indexes for faster queries
DocumentSchema.index({ userId: 1, documentType: 1 })
DocumentSchema.index({ uploadDate: -1 })

export default mongoose.models.Document || mongoose.model("Document", DocumentSchema)

