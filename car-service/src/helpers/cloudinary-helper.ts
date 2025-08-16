import cloudinary from "../config/cloudinary"; // sua configuração do Cloudinary
import fs from "fs"; // necessário para remover os arquivos locais após o upload

const uploadToCloudinary = async (file: any) => {
  try {
    // Certifique-se de que file é um caminho válido e que o arquivo existe
    if (!file || !fs.existsSync(file)) {
      throw new Error("Arquivo não encontrado.");
    }

    // Fazendo upload para o Cloudinary
    const result = await cloudinary.uploader.upload(file, {
      resource_type: "auto", // Detecta automaticamente o tipo de recurso
    });

    // Retorna o URL seguro e o publicId do arquivo
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