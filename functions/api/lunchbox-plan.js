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


/*
  GET LUNCHBOX PLAN
*/

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


    const { env, request } = context;

    const url =
      new URL(request.url);

    const startDate =
      url.searchParams.get("start");

    const endDate =
      url.searchParams.get("end");


    let query = `
      SELECT
        id,
        lunch_date,
        lunchbox,
        notes,
        created_at,
        updated_at
      FROM lunchbox_plan
    `;

    const values = [];


    if (startDate && endDate) {

      query += `
        WHERE lunch_date >= ?
        AND lunch_date <= ?
      `;

      values.push(
        startDate,
        endDate
      );

    }


    query += `
      ORDER BY lunch_date ASC
    `;


    const statement =
      env.DB.prepare(query);


    const result =
      values.length > 0
        ? await statement
            .bind(...values)
            .all()
        : await statement.all();


    return Response.json({
      success: true,
      lunches: result.results || []
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


/*
  SAVE / UPDATE LUNCHBOX
*/

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


    const { env, request } = context;

    const body =
      await request.json();

    const lunchDate =
      body.lunch_date;


    if (!lunchDate) {

      return Response.json(
        {
          success: false,
          error: "Lunch date is required."
        },
        {
          status: 400
        }
      );

    }


    await env.DB
      .prepare(`
        INSERT INTO lunchbox_plan (
          lunch_date,
          lunchbox,
          notes,
          updated_at
        )
        VALUES (?, ?, ?, CURRENT_TIMESTAMP)

        ON CONFLICT(lunch_date)
        DO UPDATE SET
          lunchbox = excluded.lunchbox,
          notes = excluded.notes,
          updated_at = CURRENT_TIMESTAMP
      `)
      .bind(
        lunchDate,
        body.lunchbox || null,
        body.notes || null
      )
      .run();


    const saved =
      await env.DB
        .prepare(`
          SELECT *
          FROM lunchbox_plan
          WHERE lunch_date = ?
        `)
        .bind(lunchDate)
        .first();


    return Response.json({
      success: true,
      lunch: saved
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
