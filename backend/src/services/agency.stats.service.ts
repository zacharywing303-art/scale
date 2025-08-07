import prisma from "../lib/db";

export const getSystemStats = async () => {
  // totalVisits, totalHours to be implemented
  const totalVisits = 0; // Placeholder
  const totalHours = { _sum: { durationMinutes: 0 } }; // Placeholder
  const [totalAgencies, activeAgencies, totalUsers] = await Promise.all([
    prisma.agency.count(),
    prisma.agency.count({ where: { status: "Active" } }),
    prisma.user.count(),
    //   prisma.visit.count(),
    //   prisma.visit.aggregate({ _sum: { durationMinutes: true } }),
  ]);

  const subscriptionBreakdown = await prisma.agency.groupBy({
    by: ["subscriptionPlan"],
    _count: true,
  });

  const agenciesPerState = await prisma.agency.groupBy({
    by: ["state"],
    _count: true,
  });

  return {
    totalAgencies,
    activeAgencies,
    inactiveAgencies: totalAgencies - activeAgencies,
    totalUsers,
    totalVisits,
    totalHours: totalHours._sum.durationMinutes || 0,
    averageHoursPerAgency:
      totalAgencies > 0
        ? Math.round((totalHours._sum.durationMinutes || 0) / totalAgencies)
        : 0,
    subscriptionBreakdown: subscriptionBreakdown.map((item) => ({
      name: item.subscriptionPlan,
      value: item._count,
    })),
    agenciesPerState: agenciesPerState.map((item) => ({
      state: item.state,
      count: item._count,
    })),
  };
};
