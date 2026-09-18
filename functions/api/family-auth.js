export async function onRequestPost(context) {

  try {

    const body =
      await context.request.json();

    const providedCode =
      String(body.code || "").trim();

    const correctCode =
      context.env.FAMILY_CODE;


    if (
      !providedCode ||
      !correctCode ||
      providedCode !== correctCode
    ) {

      return Response.json(
        {
          success: false,
          error: "Incorrect Family Code."
        },
        {
          status: 401
        }
      );

    }


    return Response.json({
      success: true
    });


  } catch (error) {

    return Response.json(
      {
        success: false,
        error: "Could not verify Family Code."
      },
      {
        status: 500
      }
    );

  }

}
