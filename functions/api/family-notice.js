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
   GET NOTICE
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

    const notice =
      await context.env.DB
        .prepare(`
          SELECT
            id,
            message,
            updated_at
          FROM family_notice
          ORDER BY id DESC
          LIMIT 1
        `)
        .first();

    return Response.json({
      success: true,
      notice: notice || null
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
   SAVE / UPDATE NOTICE
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

    const message =
      String(
        body.message || ""
      ).trim();

    if (!message) {

      return Response.json(
        {
          success: false,
          error: "Notice message is required."
        },
        {
          status: 400
        }
      );

    }

    await context.env.DB
      .prepare(`
        INSERT INTO family_notice (
          message,
          updated_at
        )
        VALUES (
          ?,
          CURRENT_TIMESTAMP
        )
      `)
      .bind(message)
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
