import { Request, Response } from "express";
import { UserService } from "../service/user.service";
import { CreateUserDTO, LoginUserDTO, UpdateUserDTO } from "../dtos/user.dto";
import z, { success } from "zod";


let userService = new UserService();
export class AuthController{
  async register(req: Request, res: Response) {
    try {
      const parsedData = CreateUserDTO.safeParse(req.body);
      if(!parsedData.success) {
        return res.status(404).json(
          {success: false, message: z.prettifyError(parsedData.error)}
        )
      }

      const userData: CreateUserDTO = parsedData.data;

      const newUser = await userService.createUser(userData);

      return res.status(200).json(
        {success: true, message: "user created", data: newUser}
      )
    } catch (error: Error | any) {
      return res.status(error.status ?? 500).json(
        {success: false, message: error.message?? "Internal server Error"}
      )
    }
  }

  async login(req: Request, res:Response) {
    try {
      const parsedData = LoginUserDTO.safeParse(req.body);
      if(!parsedData.success){
        return res.status(404).json(
          {success: false, message: z.prettifyError(parsedData.error)}
        );
      }
  
      const userData: LoginUserDTO= parsedData.data;
      const {token, user} = await userService.loginUser(userData);

      return res.status(200).json(
        {success: true, message: "Login successful", data: user, token}
      )
    } catch (error: Error | any) {
      return res.status(error.status ?? 500).json(
        {success: false, message: error.message || "Internal Server Error"}
      )
    }
  }

  async updateUser(req: Request, res: Response) {
    try {
      const userId = req.user?._id;
      if(!userId) {
        return res.status(400).json(
          {success : false, message: "User ID not provided"}
        );
      }
      let parsedData = UpdateUserDTO.safeParse(req.body);
      if(!parsedData.success) {
        return res.status(400).json(
          {success: false, message: z.prettifyError(parsedData.error)}
        );
      }

         const updatePayload: any = { ...parsedData.data };

    // file comes from req.file
    if (req.file) {
  updatePayload.profilePicture = `/uploads/${req.file.filename}`;
}

    const updatedUser = await userService.updateUser(userId, updatePayload);

      return res.status(200).json(
        {success : true, message: "User updated Successfully", data: updatedUser}
      );
    } catch (error: Error | any) {
      return res.status(error.statusCode ?? 500).json(
        {success: false, message: error.message || "Internal Server Error"}
      );
    }
  }

    async uploadProfilePicture(req: Request, res: Response){
    try {
      const file = req.file as Express.Multer.File;
      const fileName = await userService.uploadProfilePicture(file);
      res.status(200).json({
      success: true,
      message: "Photo uploaded successfully",
      data: fileName,
    });
    } catch (error: Error | any) {
      return res.status(error.statusCode ?? 500).json(
        {success: false, message: error.message || "Internal Server Error"}
      );
    }
  }
}