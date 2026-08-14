import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2"

const invoiceItemSchema = new mongoose.Schema(
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true
        },

        name: {
            type: String,
            required: true,
            trim: true
        },

        quantity: {
            type: Number,
            required: true,
            min: 1
        },

        unitPrice: {
            type: Number,
            required: true,
            min: 0
        },

        totalPrice: {
            type: Number,
            required: true,
            min: 0
        }
    },
    { _id: false }
);

const invoiceSchema = new mongoose.Schema(
    {
        shopId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Shop",
            required: true
        },

        invoiceNumber: {
            type: String,
            required: true,
            trim: true
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        customer: {
            name: {
                type: String,
                trim: true
            },

            phone: {
                type: String,
                trim: true
            },

            email: {
                type: String,
                trim: true,
                lowercase: true
            }
        },

        items: {
            type: [invoiceItemSchema],
            required: true,
            validate: {
                validator: (items) => items.length > 0,
                message: "Invoice must contain at least one item"
            }
        },

        subTotal: {
            type: Number,
            required: true,
            min: 0
        },

        taxTotal: {
            type: Number,
            required: true,
            min: 0,
            default: 0
        },

        grandTotal: {
            type: Number,
            required: true,
            min: 0
        },

        paymentMode: {
            type: String,
            enum: ["Cash", "Card", "UPI", "Credit"],
            required: true
        },

        paymentStatus: {
            type: String,
            enum: ["Paid", "Pending", "Cancelled"],
            default: "Pending"
        }
    },
    {
        timestamps: true
    }
);

// Optimize shop-wise invoice listing and reports
invoiceSchema.index({
    shopId: 1,
    createdAt: -1
});

invoiceSchema.plugin(mongoosePaginate);



export const Invoice = mongoose.model("Invoice", invoiceSchema);