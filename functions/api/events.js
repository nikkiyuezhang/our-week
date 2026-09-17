const ALLOWED_CATEGORIES = [
  "school",
  "activity",
  "family",
  "travel",
  "reminder"
];

const ALLOWED_RECURRING = [
  "none",
  "weekly"
];


/* GET — READ ALL EVENTS */

export async function onRequestGet(context) {

  try {

    const { results } =
      await context.env.DB
        .prepare(`
          SELECT
            id,
            title,
            category,
            start_date,
            end_date,
            start_time,
            end_time,
            details,
            prepare,
            location,
            recurring,
            created_at,
            updated_at
          FROM events
          ORDER BY start_date ASC, start_time ASC
        `)
        .all();


    return Response.json({
      success: true,
      events: results || []
    });

  } catch (error) {

    return Response.json(
      {
        success: false,
        error: error.message || "Could not load events."
      },
      { status: 500 }
    );
  }
}


/* POST — ADD EVENT */

export async function onRequestPost(context) {

  try {

    const body =
      await context.request.json();


    const title =
      String(body.title || "").trim();

    const category =
      String(body.category || "family");

    const startDate =
      String(body.start_date || "");

    const endDate =
      body.end_date
        ? String(body.end_date)
        : null;

    const startTime =
      body.start_time
        ? String(body.start_time)
        : null;

    const endTime =
      body.end_time
        ? String(body.end_time)
        : null;

    const details =
      body.details
        ? String(body.details).trim()
        : null;

    const prepare =
      body.prepare
        ? String(body.prepare).trim()
        : null;

    const location =
      body.location
        ? String(body.location).trim()
        : null;

    const recurring =
      String(body.recurring || "none");


    if (!title) {

      return Response.json(
        {
          success: false,
          error: "Event title is required."
        },
        { status: 400 }
      );
    }


    if (!startDate) {

      return Response.json(
        {
          success: false,
          error: "Start date is required."
        },
        { status: 400 }
      );
    }


    if (!ALLOWED_CATEGORIES.includes(category)) {

      return Response.json(
        {
          success: false,
          error: "Invalid category."
        },
        { status: 400 }
      );
    }


    if (!ALLOWED_RECURRING.includes(recurring)) {

      return Response.json(
        {
          success: false,
          error: "Invalid recurring option."
        },
        { status: 400 }
      );
    }


    const result =
      await context.env.DB
        .prepare(`
          INSERT INTO events (
            title,
            category,
            start_date,
            end_date,
            start_time,
            end_time,
            details,
            prepare,
            location,
            recurring
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `)
        .bind(
          title,
          category,
          startDate,
          endDate,
          startTime,
          endTime,
          details,
          prepare,
          location,
          recurring
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
        error: error.message || "Could not add event."
      },
      { status: 500 }
    );
  }
}


/* PATCH — EDIT EVENT */

export async function onRequestPatch(context) {

  try {

    const body =
      await context.request.json();


    const id =
      Number(body.id);

    const title =
      String(body.title || "").trim();

    const category =
      String(body.category || "family");

    const startDate =
      String(body.start_date || "");

    const endDate =
      body.end_date
        ? String(body.end_date)
        : null;

    const startTime =
      body.start_time
        ? String(body.start_time)
        : null;

    const endTime =
      body.end_time
        ? String(body.end_time)
        : null;

    const details =
      body.details
        ? String(body.details).trim()
        : null;

    const prepare =
      body.prepare
        ? String(body.prepare).trim()
        : null;

    const location =
      body.location
        ? String(body.location).trim()
        : null;

    const recurring =
      String(body.recurring || "none");


    if (!id || !title || !startDate) {

      return Response.json(
        {
          success: false,
          error: "ID, title and start date are required."
        },
        { status: 400 }
      );
    }


    if (!ALLOWED_CATEGORIES.includes(category)) {

      return Response.json(
        {
          success: false,
          error: "Invalid category."
        },
        { status: 400 }
      );
    }


    if (!ALLOWED_RECURRING.includes(recurring)) {

      return Response.json(
        {
          success: false,
          error: "Invalid recurring option."
        },
        { status: 400 }
      );
    }


    await context.env.DB
      .prepare(`
        UPDATE events
        SET
          title = ?,
          category = ?,
          start_date = ?,
          end_date = ?,
          start_time = ?,
          end_time = ?,
          details = ?,
          prepare = ?,
          location = ?,
          recurring = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `)
      .bind(
        title,
        category,
        startDate,
        endDate,
        startTime,
        endTime,
        details,
        prepare,
        location,
        recurring,
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
        error: error.message || "Could not update event."
      },
      { status: 500 }
    );
  }
}


/* DELETE — REMOVE EVENT */

export async function onRequestDelete(context) {

  try {

    const url =
      new URL(context.request.url);

    const id =
      Number(url.searchParams.get("id"));


    if (!id) {

      return Response.json(
        {
          success: false,
          error: "Event ID is required."
        },
        { status: 400 }
      );
    }


    await context.env.DB
      .prepare(`
        DELETE FROM events
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
        error: error.message || "Could not delete event."
      },
      { status: 500 }
    );
  }
}
