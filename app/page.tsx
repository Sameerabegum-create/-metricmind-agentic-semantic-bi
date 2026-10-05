export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-7xl">
        
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            MetricMind
          </h1>

          <p className="mt-2 text-gray-600">
            AI-Powered Semantic Business Intelligence
          </p>
        </header>

        {/* Dashboard */}
        <section>
          <h2 className="mb-4 text-xl font-semibold text-gray-800">
            Business Dashboard
          </h2>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            
            <div className="rounded-xl bg-white p-6 shadow">
              <p className="text-sm text-gray-500">Total Sales</p>
              <h3 className="mt-2 text-2xl font-bold">$0</h3>
            </div>

            <div className="rounded-xl bg-white p-6 shadow">
              <p className="text-sm text-gray-500">Total Profit</p>
              <h3 className="mt-2 text-2xl font-bold">$0</h3>
            </div>

            <div className="rounded-xl bg-white p-6 shadow">
              <p className="text-sm text-gray-500">Orders</p>
              <h3 className="mt-2 text-2xl font-bold">0</h3>
            </div>

            <div className="rounded-xl bg-white p-6 shadow">
              <p className="text-sm text-gray-500">Customers</p>
              <h3 className="mt-2 text-2xl font-bold">0</h3>
            </div>

          </div>

          {/* Visualization Area */}
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">

            <div className="rounded-xl bg-white p-6 shadow">
              <h3 className="text-lg font-semibold">
                Sales Overview
              </h3>

              <div className="mt-6 flex h-64 items-center justify-center rounded-lg bg-gray-50">
                <p className="text-gray-500">
                  Sales chart will appear here
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-white p-6 shadow">
              <h3 className="text-lg font-semibold">
                Profit Overview
              </h3>

              <div className="mt-6 flex h-64 items-center justify-center rounded-lg bg-gray-50">
                <p className="text-gray-500">
                  Profit chart will appear here
                </p>
              </div>
            </div>

          </div>

          {/* AI Query Section */}
          <div className="mt-6 rounded-xl bg-white p-6 shadow">
            <h3 className="text-lg font-semibold">
              Ask MetricMind
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              Ask questions about your business data using natural language.
            </p>

            <div className="mt-4 flex gap-3">
              <input
                type="text"
                placeholder="Example: What were our total sales last month?"
                className="flex-1 rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-gray-500"
              />

              <button className="rounded-lg bg-black px-6 py-3 font-medium text-white">
                Ask
              </button>
            </div>
          </div>

        </section>
      </div>
    </main>
  );
}