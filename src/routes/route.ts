import express, { Request, Response } from "express";
import resizer from "../utilities/resizer";
import path from "path";
import fs from "fs";

const availableImages: string[] = [];
fs.readdirSync(path.join(__dirname, `../../public/images`)).forEach((image) => {
  availableImages.push(image);
});

const router = express.Router();

// endpoint for resizing the image
router.get("/resize", async (req: Request, res: Response): Promise<void> => {
  const image = (req.query.image as unknown as string).slice(0, -4);
  const width = Math.abs(parseInt(req.query.width as string));
  const height = Math.abs(parseInt(req.query.height as string));

  // make sure the parameters values are correct otherwise redirect the error page
  if (
    !availableImages.includes(image.concat(".jpg")) ||
    width <= 0 ||
    height <= 0
  ) {
    res.redirect(path.join(__dirname, `/views`, `404.js`));
  } else {
    if (
      fs.existsSync(
        path.join(
          __dirname,
          `/public/resized_images/${image}_${width}_${height}.jpg`
        )
      )
    ) {
      res.sendFile(
        path.join(
          __dirname,
          `../../public/resized_images`,
          `${image}_${width}_${height}.jpg`
        )
      );
    } else {
      try {
        await resizer(image, width, height).then(async (e) => {
          res.sendFile(
            path.join(
              __dirname,
              `../../public/resized_images`,
              `${e.image}_${e.width}_${e.height}.jpg`
            )
          );
        });
      } catch (error) {
        res.redirect(path.join(__dirname, `/views`, `404.js`));
      }
    }
  }
});

// endpoint for displaying the available images
router.get("/images", async (req: Request, res: Response): Promise<void> => {
  res.send(`
  <h1>The Available Images Are:- </h1>
  <ul>
    <li>encenadaport.jpg
    <li>fjord.jpg
    <li>icelandwaterfall.jpg
    <li>palmtunnel.jpg
    <li>santamonica.jpg
  </ul>
  `);
});

// endpoint for displaying a specific image
router.get(
  "/image/?:id",
  async (req: Request, res: Response): Promise<void> => {
    const id: number = parseInt(req.params.id);
    if (1 <= id && id <= 5) {
      res.send(availableImages[id - 1]);
    } else {
      res.send(`image with id = ${id} is not found`);
    }
  }
);
export default router;
