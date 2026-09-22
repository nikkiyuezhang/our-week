function checkFamilyCode(context) {

  const providedCode =
    context.request.headers.get(
      "X-Family-Code"
    );

  const correctCode =
    context.env.FAMILY_CODE;

  return (
    providedCode &&
    correctCode &&
    providedCode === correctCode
  );
}


/* =============================
   GET TODOS
============================= */

export async function onRequestGet(context) {

  try {

    if (!checkFamilyCode(context)) {

      return Response.json(
        {
          success: false,
          error: "Unauthorized."
        },
        {
          status: 401
        }
      );

    }


    const result =
      await context.env.DB
        .prepare(`
          SELECT
            id,
            title,
            notes,
            completed,
            created_at,
            updated_at
          FROM todo_list
          ORDER BY
            completed ASC,
            created_at DESC
        `)
        .all();


    return Response.json({
      success: true,
      todos: result.results || []
    });


  } catch (error) {

    return Response.json(
      {
        success: false,
        error: error.message
      },
      {
        status: 500
      }
    );

  }

}


/* =============================
   ADD TODO
============================= */

export async function onRequestPost(context) {

  try {

    if (!checkFamilyCode(context)) {

      return Response.json(
        {
          success: false,
          error: "Unauthorized."
        },
        {
          status: 401
        }
      );

    }


    const body =
      await context.request.json();


    const title =
      (body.title || "").trim();

    const notes =
      (body.notes || "").trim();


    if (!title) {

      return Response.json(
        {
          success: false,
          error: "Title is required."
        },
        {
          status: 400
        }
      );

    }


    const result =
      await context.env.DB
        .prepare(`
          INSERT INTO todo_list (
            title,
            notes
          )
          VALUES (?, ?)
        `)
        .bind(
          title,
          notes || null
        )
        .run();


    return Response.json({
      success: true,
      id: result.meta.last_row_id
    });


  } catch (error) {

    return Response.json(
      {
        success: false,
        error: error.message
      },
      {
        status: 500
      }
    );

  }

}


/* =============================
   UPDATE TODO
============================= */

export async function onRequestPatch(context) {

  try {

    if (!checkFamilyCode(context)) {

      return Response.json(
        {
          success: false,
          error: "Unauthorized."
        },
        {
          status: 401
        }
      );

    }

    const body =
      await context.request.json();

    const id =
      Number(body.id);

    if (!id) {

      return Response.json(
        {
          success: false,
          error: "Todo ID is required."
        },
        {
          status: 400
        }
      );

    }

    const completed =
      body.completed ? 1 : 0;

    await context.env.DB
      .prepare(`
        UPDATE todo_list
        SET
          completed = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `)
      .bind(
        completed,
        id
      )
      .run();

    return Response.json({
      success: true
    });

  } catch (error) {

    return Response.json(
      {
        success: false,
        error: error.message
      },
      {
        status: 500
      }
    );

  }

}

/* =============================
   DELETE TODO
============================= */

export async function onRequestDelete(context) {

  try {

    if (!checkFamilyCode(context)) {

      return Response.json(
        {
          success: false,
          error: "Unauthorized."
        },
        {
          status: 401
        }
      );

    }


    const url =
      new URL(context.request.url);

    const id =
      Number(
        url.searchParams.get("id")
      );


    if (!id) {

      return Response.json(
        {
          success: false,
          error: "Todo ID is required."
        },
        {
          status: 400
        }
      );

    }


    await context.env.DB
      .prepare(`
        DELETE FROM todo_list
        WHERE id = ?
      `)
      .bind(id)
      .run();


    return Response.json({
      success: true
    });


  } catch (error) {

    return Response.json(
      {
        success: false,
        error: error.message
      },
      {
        status: 500
      }
    );

  }

}
