import cloudinary from "../config/cloudinary";

const uploadToCloudinary = async (file: any) => {
  try {
    const result = await cloudinary.uploader.upload(file, {
      resource_type: "auto",
    });

    return {
      url: result.secure_url,
      publicId: result.public_id 
    };
  } catch (error) {
    console.log("Error while uploading to Cloudinary", error);
    throw new Error("Error while uploading to Cloudinary");
  }
};

export default uploadToCloudinary;