// tests/events.api.test.ts

import axiosClient from "../../shared/lib/axiosClient";
import {
  getEvents,
  getEventsByUserId,
  createEvent,
  getEventById,
  updateEvent,
  deleteEvent,
  getEventForEditing,
} from "../events/events.api";
import { Event } from "@/shared/types/event";

// Mock axiosClient
jest.mock("../../shared/lib/axiosClient");

describe("Event API Functions", () => {
  const mockEvents: Event[] = [
    {
      id: "1",
      name: "Test Event 1",
      bannerPhotoUrl: "banner1.jpg",
      isPublic: true,
      user: {
        id: "user1",
        email: "user1@test.com",
        name: "User",
        lastname: "One",
        isActive: true,
        roles: ["admin"],
      },
    },
    {
      id: "2",
      name: "Test Event 2",
      bannerPhotoUrl: "banner2.jpg",
      isPublic: false,
      user: {
        id: "user2",
        email: "user2@test.com",
        name: "User",
        lastname: "Two",
        isActive: true,
        roles: ["client"],
      },
    },
  ];

  afterEach(() => {
    jest.clearAllMocks();
  });

  // getEvents
  describe("getEvents", () => {
    it("should fetch events with default parameters", async () => {
      (axiosClient.get as jest.Mock).mockResolvedValue({ data: mockEvents });

      const result = await getEvents();

      expect(axiosClient.get).toHaveBeenCalledWith("/event/findAll", {
        params: { limit: "10", offset: "0" },
      });
      expect(result).toEqual(mockEvents);
    });

    it("should fetch events with custom parameters", async () => {
      (axiosClient.get as jest.Mock).mockResolvedValue({ data: mockEvents });

      const params = { limit: 5, offset: 20 };
      const result = await getEvents(params);

      expect(axiosClient.get).toHaveBeenCalledWith("/event/findAll", {
        params: { limit: "5", offset: "20" },
      });
      expect(result).toEqual(mockEvents);
    });

    it("should handle API error with response message", async () => {
      const mockError = {
        response: { data: { message: "Server Error" } },
      };
      (axiosClient.get as jest.Mock).mockRejectedValue(mockError);

      const result = await getEvents();
      expect(result).toEqual({ error: "Server Error" });
    });

    it("should handle error with just Error object", async () => {
      const mockError = new Error("Network Error");
      (axiosClient.get as jest.Mock).mockRejectedValue(mockError);

      const result = await getEvents();
      expect(result).toEqual({ error: "Network Error" });
    });

    it("should handle completely unknown error", async () => {
      (axiosClient.get as jest.Mock).mockRejectedValue({});
      const result = await getEvents();
      expect(result).toEqual({ error: "Error al obtener los eventos" });
    });
  });

  // getEventsByUserId
  describe("getEventsByUserId", () => {
    it("should fetch user events", async () => {
      (axiosClient.get as jest.Mock).mockResolvedValue({ data: mockEvents });
      const result = await getEventsByUserId();
      expect(result).toEqual(mockEvents);
    });

    it("should handle error with response message", async () => {
      const mockError = { response: { data: { message: "Unauthorized" } } };
      (axiosClient.get as jest.Mock).mockRejectedValue(mockError);
      const result = await getEventsByUserId();
      expect(result).toEqual({ error: "Unauthorized" });
    });
  });

  // createEvent
  describe("createEvent", () => {
    it("should create an event", async () => {
      const event = mockEvents[0];
      (axiosClient.post as jest.Mock).mockResolvedValue({ data: event });

      const result = await createEvent(event.name, event.isPublic, event.bannerPhotoUrl);
      expect(result).toEqual(event);
    });

    it("should handle error with message", async () => {
      const mockError = { response: { data: { message: "Creation failed" } } };
      (axiosClient.post as jest.Mock).mockRejectedValue(mockError);

      const result = await createEvent("New Event", true, "img.jpg");
      expect(result).toEqual({ error: "Creation failed" });
    });
  });

  // getEventById
  describe("getEventById", () => {
    it("should return event by ID", async () => {
      const event = mockEvents[0];
      (axiosClient.get as jest.Mock).mockResolvedValue({ data: event });

      const result = await getEventById("1");
      expect(result).toEqual(event);
    });

    it.each([
      [404, "Evento no encontrado"],
      [403, "No tienes permisos para ver este evento"],
      [401, "Debes iniciar sesión para ver este evento"],
    ])("should handle error %s", async (status, message) => {
      (axiosClient.get as jest.Mock).mockRejectedValue({ response: { status } });

      const result = await getEventById("x");
      expect(result).toEqual({ error: message });
    });
  });

  // updateEvent
  describe("updateEvent", () => {
    it("should update event data", async () => {
      const updated = { ...mockEvents[0], name: "Updated Name" };
      (axiosClient.put as jest.Mock).mockResolvedValue({ data: updated });

      const result = await updateEvent("1", { name: "Updated Name" });
      expect(result).toEqual(updated);
    });

    it.each([
      [404, "Evento no encontrado"],
      [403, "No tienes permisos para editar este evento"],
      [401, "Debes iniciar sesión para editar este evento"],
    ])("should handle error %s", async (status, message) => {
      (axiosClient.put as jest.Mock).mockRejectedValue({ response: { status } });

      const result = await updateEvent("1", { name: "x" });
      expect(result).toEqual({ error: message });
    });
  });

  // deleteEvent
  describe("deleteEvent", () => {
    it("should delete the event", async () => {
      (axiosClient.delete as jest.Mock).mockResolvedValue({});
      const result = await deleteEvent("1");
      expect(result).toEqual({ success: true });
    });

    it.each([
      [404, "Evento no encontrado"],
      [403, "No tienes permisos para eliminar este evento"],
      [401, "Debes iniciar sesión para eliminar este evento"],
    ])("should handle error %s", async (status, message) => {
      (axiosClient.delete as jest.Mock).mockRejectedValue({ response: { status } });

      const result = await deleteEvent("1");
      expect(result).toEqual({ success: false, error: message });
    });
  });

  // getEventForEditing
  describe("getEventForEditing", () => {
    it("should get event for editing", async () => {
      (axiosClient.get as jest.Mock).mockResolvedValue({ data: mockEvents[0] });
      const result = await getEventForEditing("1");
      expect(result).toEqual(mockEvents[0]);
    });

    it.each([
      [404, "Evento no encontrado"],
      [403, "No tienes permisos para editar este evento"],
      [401, "Debes iniciar sesión para editar este evento"],
    ])("should handle error %s", async (status, message) => {
      (axiosClient.get as jest.Mock).mockRejectedValue({ response: { status } });

      const result = await getEventForEditing("1");
      expect(result).toEqual({ error: message });
    });
  });

  describe("getEventById error handling", () => {
    const mockedAxios = axiosClient as jest.Mocked<typeof axiosClient>;

    it("debe retornar error con message de error.response.data.message", async () => {
      const error = {
        response: {
          data: {
            message: "Mensaje de error personalizado",
          },
        },
      };
      mockedAxios.get.mockRejectedValueOnce(error);

      const result = await getEventById("123");
      expect(result).toEqual({ error: "Mensaje de error personalizado" });
    });

    it("debe retornar error con error.message cuando no hay response.data.message", async () => {
      const error = {
        message: "Mensaje de error general",
      };
      mockedAxios.get.mockRejectedValueOnce(error);

      const result = await getEventById("123");
      expect(result).toEqual({ error: "Mensaje de error general" });
    });

    it("debe retornar mensaje default cuando no hay response ni message", async () => {
      const error = {};
      mockedAxios.get.mockRejectedValueOnce(error);

      const result = await getEventById("123");
      expect(result).toEqual({ error: "Error al obtener el evento" });
    });
  });
});
