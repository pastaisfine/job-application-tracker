import mongoose, { Schema, Document } from "mongoose";

export interface IBoard extends Document { //IBoard represents a single Board document that is ready to interact with the database.
    name: string;
    userId: string;
    columns: mongoose.Types.ObjectId[];
    cresaetdAt: Date;
    updatedAt: Date;
}

const BoardSchema: Schema = new Schema<IBoard>(
    {
        name: {
            type: String,
            required: true
        },
        userId: {
            type: String,
            required: true,
            index: true
        },
        columns: [
            {
                type: Schema.Types.ObjectId,
                ref: "Column"
            }
        ]
    },
    { timestamps: true }
);

export default mongoose.models.Board || mongoose.model<IBoard>("Board", BoardSchema); //Create model