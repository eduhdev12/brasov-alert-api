import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { AuthorizedRoute } from "../dto/auth.dto";
import {
  IManipulateReport,
  LocationReportsResponse,
  ManipulateReport,
  TouchedReport,
} from "../dto/reports.dto";
import Controller, { ErrorResponse, Methods } from "../types/controller.type";

export default class ReportsController extends Controller {
  public path = "/reports";
  public routes = [
    {
      path: "",
      method: Methods.GET,
      handler: this.getLocationReports.bind(this),
      onRequest: [global.server.app.authenticate],
      schema: {
        tags: ["reports"],
        response: {
          200: LocationReportsResponse,
          500: ErrorResponse,
        },
        ...AuthorizedRoute,
      },
    },
    {
      path: "/me",
      method: Methods.GET,
      handler: this.getUserReports.bind(this),
      onRequest: [global.server.app.authenticate],
      schema: {
        tags: ["reports"],
        response: {
          200: LocationReportsResponse,
          500: ErrorResponse,
        },
        ...AuthorizedRoute,
      },
    },
    {
      path: "/new",
      method: Methods.POST,
      handler: this.createReport.bind(this),
      onRequest: [global.server.app.authenticate],
      schema: {
        tags: ["reports"],
        body: ManipulateReport,
        response: {
          200: TouchedReport,
          500: ErrorResponse,
        },
        ...AuthorizedRoute,
      },
    },
    {
      path: "/:reportId",
      method: Methods.PATCH,
      handler: this.editReport.bind(this),
      onRequest: [global.server.app.authenticate],
      schema: {
        tags: ["reports"],
        body: ManipulateReport,
        response: { 200: TouchedReport, 500: ErrorResponse },
        ...AuthorizedRoute,
      },
    },
    {
      path: "/:reportId",
      method: Methods.DELETE,
      handler: this.deleteReport.bind(this),
      onRequest: [global.server.app.authenticate],
      schema: {
        tags: ["reports"],
        response: {
          500: ErrorResponse,
        },
        ...AuthorizedRoute,
      },
    },
  ];

  constructor(router: FastifyInstance) {
    super(router);
  }

  private async getLocationReports(req: FastifyRequest, reply: FastifyReply) {
    const userDetails = await global.database.user.findUnique({
      where: { id: req.user.id },
    });
    if (!userDetails || !userDetails.localitate)
      throw new Error("Unauthorized");

    const reports = await global.database.report.findMany({
      where: { localitate: userDetails.localitate },
    });

    return this.sendSuccess(reply, reports);
  }

  private async getUserReports(req: FastifyRequest, reply: FastifyReply) {
    const reports = await global.database.report.findMany({
      where: { authorId: req.user.id },
    });

    if (reports.length === 0) return this.sendError(reply, "No reports found");

    return this.sendSuccess(reply, reports);
  }

  private async createReport(
    req: FastifyRequest<{ Body: IManipulateReport }>,
    reply: FastifyReply
  ) {
    try {
      const newReport = await global.database.report.create({
        data: { ...req.body, author: { connect: { id: req.user.id } } },
      });

      return this.sendSuccess(reply, newReport, "Report created");
    } catch (createError) {
      global.logger.success("");

      return this.sendError(reply, `Unable to create report`);
    }
  }

  private async editReport(
    req: FastifyRequest<{
      Params: { reportId: string };
      Body: IManipulateReport;
    }>,
    reply: FastifyReply
  ) {
    const { reportId } = req.params;
    const reportData = req.body;

    try {
      const editedReport = await global.database.report.update({
        where: { id: reportId, authorId: req.user.id },
        data: reportData,
      });

      return this.sendSuccess(reply, editedReport, "Edited report");
    } catch (editError) {
      return this.sendError(reply, `Unable to edit report ${reportId}`);
    }
  }

  private async deleteReport(
    req: FastifyRequest<{ Params: { reportId: string } }>,
    reply: FastifyReply
  ) {
    const { reportId } = req.params;

    try {
      const deletedReport = await global.database.report.delete({
        where: { id: reportId, authorId: req.user.id },
      });
      return this.sendSuccess(reply, deletedReport, `Deleted report`);
    } catch (deleteError) {
      return this.sendError(
        reply,
        `Unable to delete report with id: ${reportId}`
      );
    }
  }
}
