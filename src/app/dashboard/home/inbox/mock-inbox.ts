const mockMessages = [
  {
    id: "1",
    name: "John Doe (Caregiver)",
    unread: 2,
    messages: [
      {
        sender: "john",
        content: "Hey, I'm running 10 minutes late.",
        timestamp: "2025-07-17T14:00:00Z",
      },
      {
        sender: "me",
        content: "Thanks for the heads-up!",
        timestamp: "2025-07-17T14:01:00Z",
      },
    ],
  },
  {
    id: "2",
    name: "Agency Office",
    unread: 0,
    messages: [
      {
        sender: "office",
        content: "Don’t forget to submit timesheets today.",
        timestamp: "2025-07-17T12:00:00Z",
      },
    ],
  },
  {
    id: "3",
    name: "Maria Gonzalez (Client)",
    unread: 1,
    messages: [
      {
        sender: "maria",
        content: "Can we change my appointment to 3 PM?",
        timestamp: "2025-07-17T09:30:00Z",
      },
    ],
  },
];

export default mockMessages;
