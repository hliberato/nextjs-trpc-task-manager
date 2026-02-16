import NewTaskForm from './NewTaskForm';

/**
 * Task creation page
 *
 * Design decision: Separate page instead of modal/inline form
 * - Clearer user flow and navigation
 * - Better for accessibility (full page focus)
 * - Shareable URL for creating tasks
 * - Matches traditional CRUD patterns expected in assessment
 */
export default function NewTaskPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <NewTaskForm />
      </div>
    </main>
  );
}
