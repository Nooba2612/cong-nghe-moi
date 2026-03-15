import path from "path";
import express from "express";
import expressLayouts from "express-ejs-layouts";
import dotenv from "dotenv";
import methodOverride from "method-override";
import productRoutes from "./src/routes/productRoutes.js";

dotenv.config();
const app = express();
const __dirname = path.resolve();

const PORT = process.env.PORT || 3000;


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src", "views"));
app.use(expressLayouts);
app.set("layout", "layouts/main");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
    res.locals.flash = {
        success: req.query.success || "",
        error: req.query.error || "",
    };
    next();
});

app.use("/products", productRoutes);
app.get("/", (req, res) => res.redirect("/products"));

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).render("error", {
        title: "Đã xảy ra lỗi",
        message: err.message || "Vui lòng thử lại sau.",
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
