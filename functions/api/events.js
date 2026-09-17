/* DELETE — REMOVE EVENT */

export async function onRequestDelete(context) {

  try {

    const url =
      new URL(context.request.url);

    const id =
      Number(url.searchParams.get("id"));

    const date =
      url.searchParams.get("date");

    const mode =
      url.searchParams.get("mode") || "all";


    if (!id) {

      return Response.json(
        {
          success: false,
          error: "Event ID is required."
        },
        { status: 400 }
      );
    }


    /*
      DELETE ONLY ONE OCCURRENCE
      OF A WEEKLY EVENT
    */

    if (mode === "single") {

      if (!date) {

        return Response.json(
          {
            success: false,
            error: "Event date is required."
          },
          { status: 400 }
        );
      }


      const event =
        await context.env.DB
          .prepare(`
            SELECT
              id,
              recurring
            FROM events
            WHERE id = ?
          `)
          .bind(id)
          .first();


      if (!event) {

        return Response.json(
          {
            success: false,
            error: "Event not found."
          },
          { status: 404 }
        );
      }


      if (event.recurring !== "weekly") {

        return Response.json(
          {
            success: false,
            error: "Single occurrence deletion is only available for weekly events."
          },
          { status: 400 }
        );
      }


      await context.env.DB
        .prepare(`
          INSERT OR IGNORE INTO event_exceptions (
            event_id,
            exception_date,
            exception_type
          )
          VALUES (?, ?, 'deleted')
        `)
        .bind(
          id,
          date
        )
        .run();


      return Response.json({
        success: true,
        mode: "single",
        date: date
      });
    }


    /*
      DELETE ENTIRE EVENT / WEEKLY SERIES
    */

    await context.env.DB
      .prepare(`
        DELETE FROM event_exceptions
        WHERE event_id = ?
      `)
      .bind(id)
      .run();


    await context.env.DB
      .prepare(`
        DELETE FROM events
        WHERE id = ?
      `)
      .bind(id)
      .run();


    return Response.json({
      success: true,
      mode: "all"
    });


  } catch (error) {

    return Response.json(
      {
        success: false,
        error:
          error.message ||
          "Could not delete event."
      },
      { status: 500 }
    );
  }
}
