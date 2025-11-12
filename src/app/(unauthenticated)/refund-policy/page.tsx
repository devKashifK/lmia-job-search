import Navbar from '@/components/ui/nabvar';
import Footer from '@/pages/homepage/footer';

export default function NoRefundPolicy() {
  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-16 mt-20">
        <h1 className="text-3xl font-semibold mb-6">No Refund Policy</h1>

        {/* <p className="text-sm text-muted-foreground mb-8">
          Last updated: {new Date().toLocaleDateString()}
        </p> */}

        <p className="mb-4">
          By purchasing any of our services, products, subscriptions, or digital
          content (collectively, the &quot;Services&quot;), you acknowledge and
          agree to this No Refund Policy. Please read this policy carefully
          before making any payment.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-3">
          1. All Sales Are Final
        </h2>
        <p className="mb-4">
          All payments made to us are non-refundable. Once a purchase is
          completed, we do not offer refunds, returns, or exchanges for any
          reason, including but not limited to:
        </p>
        <ul className="list-disc list-inside space-y-1 mb-4">
          <li>Change of mind after purchase</li>
          <li>
            Dissatisfaction with the Services, where the Services have been
            delivered as described
          </li>
          <li>Failure to use or access the Services</li>
          <li>Purchases made by mistake or without proper authorization</li>
        </ul>

        <h2 className="text-xl font-semibold mt-8 mb-3">
          2. Digital &amp; Online Services
        </h2>
        <p className="mb-4">
          Due to the nature of digital products and online services, all access
          provided (including but not limited to digital content, downloadable
          materials, consultations, or platform access) is considered consumed
          once access is granted. For this reason, we cannot provide refunds
          under any circumstances once access has been issued.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-3">
          3. Subscriptions &amp; Renewals
        </h2>
        <p className="mb-4">
          If you subscribe to a recurring plan, it is your responsibility to
          manage, update, or cancel your subscription before the next billing
          date. Fees already charged for past or current billing periods are
          non-refundable, even if you cancel your subscription before the end of
          the billing cycle.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-3">
          4. Incorrect or Duplicate Payments
        </h2>
        <p className="mb-4">
          In exceptional cases involving technical errors on our side (such as
          duplicate charges), we may review the transaction and, at our sole
          discretion, process an adjustment or reversal. You must notify us in
          writing within 7 days of the transaction date with proof of the error
          for us to review the case.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-3">
          5. Chargebacks &amp; Disputes
        </h2>
        <p className="mb-4">
          Initiating a chargeback or payment dispute without first contacting us
          may be considered a breach of this policy. We reserve the right to
          suspend or terminate access to our Services for any user who initiates
          a chargeback or dispute that is found to be invalid or fraudulent.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-3">
          6. Changes to This Policy
        </h2>
        <p className="mb-4">
          We may update or modify this No Refund Policy from time to time. Any
          changes will be effective upon posting the updated policy on this
          page. Your continued use of our Services after such changes
          constitutes your acceptance of the updated policy.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-3">7. Contact Us</h2>
        <p className="mb-1">
          If you have any questions about this No Refund Policy, you can contact
          us at:
        </p>
        <p className="mb-4">
          <span className="font-medium">Email:</span> info@example.com
        </p>

        <p className="text-xs text-muted-foreground mt-6">
          This policy is for general informational purposes only and does not
          constitute legal advice. Please consult with a legal professional to
          ensure that this policy meets the legal requirements of your
          jurisdiction and your specific business model.
        </p>
      </div>
      <Footer />
    </>
  );
}
