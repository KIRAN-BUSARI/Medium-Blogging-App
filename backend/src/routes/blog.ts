import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";

export const blogRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
  };
  Variables: {
    userId: string;
  };
}>();

blogRouter.post("/create-blog", async (c) => {
  const userId = c.get("userId");
  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL,
  }).$extends(withAccelerate());

  const body = await c.req.json();
  console.log(userId);

  try {
    const post = await prisma.post.create({
      data: {
        title: body.title,
        content: body.content,
        authorId: userId,
      },
    });
    return c.json({
      status: true,
      message: "post created successfully",
      id: post.id,
    });
  } catch (error) {
    return c.json({
      error: "error while creating post",
    });
  }
});

blogRouter.put("/update-blog", async (c) => {
  const userId = c.get("userId");
  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL,
  }).$extends(withAccelerate());

  const body = await c.req.json();
  try {
    console.log(userId);
    const post = await prisma.post.update({
      where: {
        id: body.id,
        authorId: userId,
      },
      data: {
        title: body.title,
        content: body.content,
      },
    });
    c.status(200);
    return c.json({
      status: true,
      message: "post updated successfully",
      post,
    });
  } catch (error) {
    c.status(403);
    return c.json({ error: "error while updating post" });
  }
});

blogRouter.get("/:id", async (c) => {
  const id = c.req.param("id");
  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL,
  }).$extends(withAccelerate());
  console.log(id);

  const post = await prisma.post.findUnique({
    where: {
      id,
    },
  });

  return c.json(post);
});

blogRouter.get("/", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const posts = await prisma.post.findMany({});
    if (posts) {
      c.status(200);
      return c.json({
        status: true,
        message: "posts fetched successfully",
        posts: posts,
      });
    } else {
      c.status(403);
      return c.json({
        error: "error while fetching posts",
      });
    }
  } catch (error) {
    c.status(403);
    return c.json({
      error: "error while fetching posts",
    });
  }
});

blogRouter.delete("/delete-blog/:id", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL,
  }).$extends(withAccelerate());

  const id = c.req.param("id");
  console.log(id);
  try {
    const post = await prisma.post.delete({
      where: {
        id,
      },
    });

    c.status(200);
    return c.json({
      status: true,
      message: "post deleted successfully",
      post,
    });
  } catch (error) {
    c.status(403);
    return c.json({ error: "error while deleting post" });
  }
});
