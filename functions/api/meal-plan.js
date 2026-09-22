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
  GET MEAL PLAN
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

    const url = new URL(request.url);

    const startDate =
      url.searchParams.get("start");

    const endDate =
      url.searchParams.get("end");


    let query = `
      SELECT
        id,
        meal_date,
        breakfast,
        lunch,
        snack,
        dinner,
        notes,
        created_at,
        updated_at
      FROM meal_plan
    `;

    const values = [];


    /*
      OPTIONAL DATE RANGE
    */

    if (startDate && endDate) {

      query += `
        WHERE meal_date >= ?
        AND meal_date <= ?
      `;

      values.push(
        startDate,
        endDate
      );

    }


    query += `
      ORDER BY meal_date ASC
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

      meals:
        result.results || []

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
  CREATE / SAVE MEAL PLAN
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


    const mealDate =
      body.meal_date;


    if (!mealDate) {

      return Response.json(
        {
          success: false,
          error: "Meal date is required."
        },
        {
          status: 400
        }
      );

    }


    /*
      INSERT NEW DAY OR UPDATE
      EXISTING DAY
    */

    await env.DB
      .prepare(`
        INSERT INTO meal_plan (
          meal_date,
          breakfast,
          lunch,
          snack,
          dinner,
          notes,
          updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)

        ON CONFLICT(meal_date)
        DO UPDATE SET
          breakfast = excluded.breakfast,
          lunch = excluded.lunch,
          snack = excluded.snack,
          dinner = excluded.dinner,
          notes = excluded.notes,
          updated_at = CURRENT_TIMESTAMP
      `)
      .bind(
        mealDate,
        body.breakfast || null,
        body.lunch || null,
        body.snack || null,
        body.dinner || null,
        body.notes || null
      )
      .run();


    /*
      RETURN SAVED RECORD
    */

    const saved =
      await env.DB
        .prepare(`
          SELECT *
          FROM meal_plan
          WHERE meal_date = ?
        `)
        .bind(mealDate)
        .first();


    return Response.json({

      success: true,

      meal: saved

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
  DELETE ONE DAY'S MEAL PLAN
*/

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


    const { env, request } = context;

    const url =
      new URL(request.url);

    const mealDate =
      url.searchParams.get("date");


    if (!mealDate) {

      return Response.json(
        {
          success: false,
          error: "Meal date is required."
        },
        {
          status: 400
        }
      );

    }


    await env.DB
      .prepare(`
        DELETE FROM meal_plan
        WHERE meal_date = ?
      `)
      .bind(mealDate)
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
